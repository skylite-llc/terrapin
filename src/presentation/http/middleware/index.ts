import ApiMiddleware from '@middlewares/ApiMiddleware'
import AuthenticatedMiddleware from '@middlewares/AuthenticatedMiddleware'
import ChannelMiddleware from '@middlewares/ChannelMiddleware'
import PolicyMiddleware from '@middlewares/PolicyMiddleware'
import ValidationMiddleware from '@middlewares/ValidationMiddleware'

export const middleware = [
  AuthenticatedMiddleware,
  ApiMiddleware,
  PolicyMiddleware,
  ValidationMiddleware,
  ChannelMiddleware,
]
