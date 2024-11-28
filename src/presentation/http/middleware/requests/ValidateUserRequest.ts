import BaseRequest from '@requests/BaseRequest'
import { z, AnyZodObject } from 'zod'

export default class ValidateUserRequest extends BaseRequest {
  static schema: AnyZodObject = z.object({
    body: z.object({}),
  })
}
