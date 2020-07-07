import React from 'react';
import TitleTextImageForm from '@/components/TitleTextImageForm';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function TitleTextImage({ form, setMetadata }) {
  return (
    <>
      {(() => {
        const components = [];
        for (let i = 1; i < 4; i++) {
          components.push(
            <TitleTextImageForm
              key={i}
              labels={{
                text: `Text ${i}`,
                title: `Title ${i}`,
                image: `Image ${i}`,
              }}
              value={{
                text: form.metadata[`text${i}`],
                image: form.metadata[`image${i}`],
                title: form.metadata[`title${i}`],
              }}
              onChange={({ title, text, image }) => setMetadata({
                [`text${i}`]: text,
                [`image${i}`]: image,
                [`title${i}`]: title,
              })}
            />
          );
        }
        return components;
      })()}
    </>
  );
}

export default wrapMetadataFormItem(TitleTextImage);
