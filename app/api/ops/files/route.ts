import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq, isNotNull, or } from "drizzle-orm";
import sizeOf from 'image-size';
import axios from 'axios';

import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";
import db from "@/databases/pg/drizzle";
import { screens as screensTable, diagnoses as diagnosesTable, files } from "@/databases/pg/schema";
import { _saveFile, SaveFileOptions } from "@/databases/mutations/files";
import { getAppUrl, getUploadUrl } from "@/lib/urls";
import { getRemoteImageSize } from "@/lib/image-size";

const isDataURL = (obj: any) => {
    const img = obj as { fileId: string; data: string; };
    if (!img?.data || img?.fileId) return false;
    return true;
};

const upload = async (data: any[]) => {
    const imgs = data.map(img => {
        const [, imageData] = (img?.data || '').split(',');

        if (!imageData || !isDataURL(img)) return img;

        const fileId = uuidv4();
        let filename = [fileId, img.filename].filter(s => s).join('__');
        
        return {
            ...img,
            fileId,
            filename,
            data: Buffer.from(imageData, 'base64'),
        };
    });
    
    let i = 0;
    for (const img of imgs) {
        if (img) {
            let {
                data,
                fileId,
                type,
                size,
                filename,
            } = img;

            const originalFilename = filename;

            await _saveFile(
                {
                    data: data as unknown as Buffer,
                    contentType: type,
                    fileId,
                    filename,
                    size,
                    metadata: {},
                },
            );

            let url = getAppUrl('/api/files/' + fileId);

            const res = await axios.post<{
                data: Awaited<ReturnType<typeof getRemoteImageSize>>;
                errors?: string[];
            }>(getAppUrl('/api/files/get-image-size'), { imageURL: url, });

            const metadata = { ...res.data.data };

            if (metadata.width || metadata.height) {
                filename = `${filename}?w=${metadata.width}&h=${metadata.height}`;
                url = `${url}?w=${metadata.width}&h=${metadata.height}`;
            }

            await db.update(files).set({ filename, metadata }).where(eq(files.fileId, fileId));

            imgs[i].data = url;
            imgs[i].filename = originalFilename;
        }
        i++;
    }

    return imgs;
};

export async function GET(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

        const screensRes = await db.query.screens.findMany({
            where: or(
                isNotNull(screensTable.image1),
                isNotNull(screensTable.image2),
                isNotNull(screensTable.image3)
            ),
            columns: {
                screenId: true,
                image1: true,
                image2: true,
                image3: true,
            }
        });

        const screens = screensRes
            .filter(s => {
                return isDataURL(s.image1) || isDataURL(s.image2) || isDataURL(s.image3);
            });

        let i = 0;
        for (const s of screens) {
            const res = await upload([s.image1, s.image2, s.image3]);
            screens[i].image1 = res[0];
            screens[i].image2 = res[1];
            screens[i].image3 = res[2];
            await db.update(screensTable).set(s).where(eq(screensTable.screenId, s.screenId));
            i++;
        }

        const diagnosesRes = await db.query.diagnoses.findMany({
            where: or(
                isNotNull(diagnosesTable.image1),
                isNotNull(diagnosesTable.image2),
                isNotNull(diagnosesTable.image3)
            ),
            columns: {
                diagnosisId: true,
                image1: true,
                image2: true,
                image3: true,
            }
        });

        const diagnoses = diagnosesRes
            .filter(s => {
                return isDataURL(s.image1) || isDataURL(s.image2) || isDataURL(s.image3);
            });

        let j = 0;
        for (const d of diagnoses) {
            const res = await upload([d.image1, d.image2, d.image3]);
            diagnoses[i].image1 = res[0];
            diagnoses[i].image2 = res[1];
            diagnoses[i].image3 = res[2];
            await db.update(diagnosesTable).set(d).where(eq(diagnosesTable.diagnosisId, d.diagnosisId));
            j++;
        }

        return NextResponse.json({
            screens,
            diagnoses,
        });
    } catch(e: any) {
        logger.log('/api/ops/files', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
