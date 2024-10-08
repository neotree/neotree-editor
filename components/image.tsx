import NextImage, { ImageProps } from 'next/image';

import { getContainerImageSize } from '@/lib/image';

type Props = ImageProps & {
    containerWidth?: number;
    width?: number;
    height?: number;
};

export function Image({
    width = 0,
    height = 0,
    containerWidth,
    ...props
}: Props) {
    let sizes: ImageProps['sizes'] = props.sizes || '100vw';
    let _style: ImageProps['style'] = { width: '100%', height: 'auto', };

    if (height && width && containerWidth) {
        sizes = undefined;
        
        const aspectRatio = getContainerImageSize({ imageWidth: width, imageHeight: height, containerWidth, });
        _style.width = aspectRatio.imageWidth;
        _style.height = aspectRatio.imageHeight;
    }

    // return (
    //     <NextImage 
    //         {...props}
    //         width={width}
    //         height={height}
    //         sizes={sizes}
    //         style={{
    //             ..._style,
    //             ...props.style,
    //         }}
    //     />
    // );

    return (
        <img 
            {...props}
            src={props.src as string}
            style={{
                ..._style,
                ...props.style,
            }}
        />
    );
}
