import { init } from './models';

export * from './models';

export const connect = () => new Promise((resolve, reject) => {
  (async () => {
    try { 
      const sequelize = await init(); 
      resolve(sequelize);
    } catch (e) { reject(e); }    
  })();
});
