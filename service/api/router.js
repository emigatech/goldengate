const express   = require('express');
const router    = express.Router();
const scrape    = require('./scrape/scrape');
const mobile    = require('./fetch/mobile');
const desktop   = require('./fetch/desktop');
const auth      = require('./auth/auth');
const storage   = require('./storage/process');
const data      = require('./data/realtimedb');
const worker    = require('./worker/process');

/** #1
 * @POST => email:string, password:string
 */
router.use('/auth',auth);
/** #2
 * @POST => url:string
 */
router.use('/fetch/mobile',mobile);
/** #2
 * @POST => url:string
 */
router.use('/fetch/desktop',desktop);
/** #3
 * @POST => key:sting
 */
router.use('/storage',storage);
/** #4
 * @POST => url:sting, cache*:string, key:string
 */
router.use('/scrape',scrape);
/** #5
 * @GET => /results/key:sting
 */
router.use('/data',data);
/** #6
 * @POST => url:string, token:string, device:string
 */
router.use('/worker',worker);

module.exports = router;