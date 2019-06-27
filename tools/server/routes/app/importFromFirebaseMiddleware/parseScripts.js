export default data => Object.keys(data.scripts).map(key => {
  const script = data.scripts[key];
  const screens = data.screens[key];
  const diagnoses = data.diagnosis[key];
  return {
    title: script.title,
    description: script.description,
    source: script.source,
    screens: !screens ? [] : Object.keys(screens).map(key => {
      const screen = screens[key];
      return {
        action_text: screen.actionText,
        content_text: screen.contentText,
        notes: screen.notes,
        condition: screen.condition,
        info_text: screen.infoText,
        epic_id: screen.epicId,
        ref_id: screen.refId,
        title: screen.title,
        source: screen.source,
        step: screen.step,
        story_id: screen.storyId,
        section_title: screen.sectionTitle,
        type: screen.type,
        metadata: screen.metadata,
        position: screen.position,
      };
    }),
    diagnoses: !diagnoses ? [] : Object.keys(diagnoses).map(key => {
      const diagnosis = diagnoses[key];
      return {
        name: diagnosis.name,
        expression: diagnosis.expression,
        description: diagnosis.description,
        source: diagnosis.source,
        text1: diagnosis.text1,
        image1: diagnosis.image1,
        text2: diagnosis.text2,
        image2: diagnosis.image2,
        text3: diagnosis.text3,
        image3: diagnosis.image3,
        symptoms: diagnosis.symptoms,
      };
    })
  };
});
