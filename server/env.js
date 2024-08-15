try {
    require('dotenv').config({ path: '.env.local', });
} catch(e) {
    // do nothing
} finally {
    require('dotenv/config');
}
