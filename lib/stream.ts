// https://dev.to/bsorrentino/how-to-stream-data-over-http-using-nextjs-1kmb

export class StreamingResponse extends Response {
    constructor( res: ReadableStream<any>, init?: ResponseInit ) {
        super(res as any, {
            ...init,
            status: 200,
            headers: {
                ...init?.headers,
            },
        });
    }
}

export const makeStream = <T extends Record<string, unknown>>(generator: AsyncGenerator<T, void, unknown>) => 
{

    const encoder = new TextEncoder();
    return new ReadableStream<any>({
        async start(controller) {
            for await (let chunk of generator) {
                const chunkData =  encoder.encode(JSON.stringify(chunk));
                controller.enqueue(chunkData);
            }
            controller.close();
        }
    });
}
