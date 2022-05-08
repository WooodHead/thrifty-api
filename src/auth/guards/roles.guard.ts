import { Injectable, CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../../user/interfaces/user.interface';
import { RequestWithUser } from '../interfaces/auth.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) return true;
        const { user } = context.switchToHttp().getRequest<RequestWithUser>();
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}

export const RoleGuard = (role: Role): Type<CanActivate> => {
    class RoleGuardMixin implements CanActivate {
        canActivate(context: ExecutionContext) {
            const { user } = context.switchToHttp().getRequest<RequestWithUser>();
            return user?.roles.includes(role);
        }
    }
    return mixin(RoleGuardMixin);
}