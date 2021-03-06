import Sequelize from 'sequelize';
import sqlz from './sequelize';

const File = sqlz.define(
  'file',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    metadata: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('metadata') || '{}');
      },
      set: function (value) {
        this.setDataValue('metadata', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    filename: { type: Sequelize.STRING },
    content_type: { type: Sequelize.STRING },
    size: { type: Sequelize.BIGINT },
    data: { type: Sequelize.BLOB('long') },
    uploaded_by: {
      type: Sequelize.INTEGER,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    },
    deletedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
  }
);

export default File;
