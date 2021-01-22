import React from 'react';
import PropTypes from 'prop-types';
import TitleTextImageForm from '@/components/TitleTextImageForm';
import wrapMetadataFormItem from './_wrapMetadataFormItem';

function Management({ form, setMetadata }) {
  const fieldsCount = 3;

  React.useEffect(() => {
    setMetadata({
      ...(() => {
        let val = {};
        for (let i = 1; i < fieldsCount + 1; i++) {
          val = {
            ...val,
            [`text${i}`]: null,
            [`image${i}`]: null,
            [`title${i}`]: null,
          };
        }
        return val;
      })(),
      ...form.metadata,
    });
  }, []);

  return (
    <>
      {(() => {
        const components = [];
        for (let i = 1; i < fieldsCount + 1; i++) {
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

Management.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormItem(Management);
