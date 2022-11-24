import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "@auth/interfaces/auth.interface";

export const UserDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<RequestWithUser>();

    return data ? user?.[data] : user;
  }
);
