import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { Analytics } from './analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, Analytics])],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
