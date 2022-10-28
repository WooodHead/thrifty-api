import {
    CanActivate,
    ExecutionContext,
    Injectable,
    mixin,
    NotFoundException,
    Type,
} from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';


export const FeatureFlagGuard = (featureFlagName: string): Type<CanActivate> => {
    @Injectable()
    class FeatureFlagGuardMixin implements CanActivate {
        constructor(private readonly featureFlagService: FeatureFlagService) { }

        async canActivate(context: ExecutionContext) {

            const isEnabled = await this.featureFlagService.isEnabled(featureFlagName);

            if (isEnabled) return true

            const httpContext = context.switchToHttp();
            const request = httpContext.getRequest();
            throw new NotFoundException(`Cannot Find Route: ${request.method} ${request.url}`);

        }
    }

    return mixin(FeatureFlagGuardMixin);
}