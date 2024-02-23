import cron from 'node-cron'
import { promoteStudents } from '../services/student.service'
/**
 * @method schedule
 * @param {string} cronExpression
 * @param {string | (now: "init" | Date | "manual") => void} func
 *  */

/* Always run on 1st Septerber at 00:00 */
cron.schedule('0 0 1 9 * *', () => promoteStudents())

/**
 * @structure
 * *  *  *  *  *  *
 * |  |  |  |  |  |
 * |  |  |  |  |  day of week
 * |  |  |  |  month
 * |  |  |  day of month
 * |  |  hour
 * |  minute
 * second
 */
