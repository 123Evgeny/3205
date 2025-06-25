import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { UrlSeederService } from './url.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(UrlSeederService);

  try {
    await seeder.seed();
    console.log('Seeding successful!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await appContext.close();
  }
}

bootstrap(); 