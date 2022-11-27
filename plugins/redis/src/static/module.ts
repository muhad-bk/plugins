import {CacheModule, Module} from '@nestjs/common';
import { RedisCacheService } from './service';

@Module({
  imports: [
    CacheModule.register()],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}