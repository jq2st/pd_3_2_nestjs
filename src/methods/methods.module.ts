import { Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { ImageConverterService } from '../services/image-converter/image-converter.service';
import { MethodsController } from './methods.controller';
import { MethodsService } from './methods.service';

@Module({
    imports: [
        AdminModule
    ],
    providers: [
        MethodsService,
        ImageConverterService
    ],
    controllers: [
        MethodsController
    ]
})
export class MethodsModule {}
