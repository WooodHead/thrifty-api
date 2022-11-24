import { Injectable, CacheInterceptor, ExecutionContext } from "@nestjs/common";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  excludePaths = ["/v1/accounts/get-account-by-user"];

  isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return (
      this.allowedMethods.includes(req.method) &&
      !this.excludePaths.includes(req.url)
    );
  }
}
