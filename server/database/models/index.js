import sequelize from './sequelize';

import User from './_User';
import File from './_File';
import Script from './_Script';
import Screen from './_Screen';
import Diagnosis from './_Diagnosis';
import ConfigKey from './_ConfigKey';
import ApiKey from './_ApiKey';
import Device from './_Device';
import Log from './_Log';
import Hospital from './_Hospital';
import Country from './_Country';
import UserHospital from './_UserHospital';
import UserCountry from './_UserCountry';

const init = () => new Promise((resolve, reject) => {
  const errors = [];
   (async () => {
      try { await sequelize.authenticate(); } catch (e) { return reject(e); }

      try { await Country.sync(); } catch (e) { errors.push(e); }
      try { await Hospital.sync(); } catch (e) { errors.push(e); }
      try { await User.sync(); } catch (e) { errors.push(e); }
      try { await File.sync(); } catch (e) { errors.push(e); }
      try { await Script.sync(); } catch (e) { errors.push(e); }
      try { await Screen.sync(); } catch (e) { errors.push(e); }
      try { await Diagnosis.sync(); } catch (e) { errors.push(e); }
      try { await ConfigKey.sync(); } catch (e) { errors.push(e); }
      try { await ApiKey.sync(); } catch (e) { errors.push(e); }
      try { await Device.sync(); } catch (e) { errors.push(e); }
      try { await Log.sync(); } catch (e) { errors.push(e); }
      try { await UserCountry.sync(); } catch (e) { errors.push(e); }
      try { await UserHospital.sync(); } catch (e) { errors.push(e); }

      if (!errors.length) { 
        resolve(sequelize); 
      } else { 
        reject(new Error(errors.map(e => e.message || e.msg || JSON.stringify(e)).join('\n'))); 
      }
   })();
 });

export {
  sequelize,
  init,
  User,
  File,
  Script,
  Screen,
  Diagnosis,
  ConfigKey,
  ApiKey,
  Device,
  Log,
  Country,
  Hospital,
  UserCountry,
  UserHospital,
};

