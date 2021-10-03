import { Body, Controller, HttpCode, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'; 
import { MethodsService } from './methods.service';

@Controller('methods')
export class MethodsController {

    constructor(private methodsService: MethodsService) {}

    @Post('method-I2030/result')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    methodI2030Result(@UploadedFile() image, @Body() methodParamsDto: any): any {
        const result = this.methodsService.methodI2030Result(image, JSON.parse(methodParamsDto.params).params)
        return result
    }

    @Post('method-IRGB/result')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    methodIRGBResult(@UploadedFile() image, @Body() methodParamsDto: any): any {
        console.log(methodParamsDto)
        const result = this.methodsService.methodIRGBResult(image, JSON.parse(methodParamsDto.params))
        return result
    }

    @Post('method-QR/result')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'code', maxCount: 1 },
      ]))
    @HttpCode(200)
    methodQRResult(@UploadedFiles() images, @Body() methodParamsDto: any): any {
        const result = this.methodsService.methodQRResult(images.image[0], images.code[0], JSON.parse(methodParamsDto.params))
        return result
    }

    @Post('method-BC/result')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    methodBCResult(@UploadedFile() image, @Body() methodParamsDto: any): any {
        console.log(methodParamsDto)
        const result = this.methodsService.methodBCResult(image, JSON.parse(methodParamsDto.params))
        return result
    }

    @Post('method-FLU/preview')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    methodFLUPreview(@UploadedFile() image, @Body() methodParamsDto: any): any {
        console.log(methodParamsDto)
        const result = this.methodsService.methodFLUPreview(image, JSON.parse(methodParamsDto.params))
        return result
    }

    @Post('method-FLU/result')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    methodFLUResult(@UploadedFile() image, @Body() methodParamsDto: any): any {
        console.log(methodParamsDto)
        const result = this.methodsService.methodFLUResult(image, JSON.parse(methodParamsDto.params))
        return result
    }

    @Post('color-layers/rgb')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    colorLayersRGB(@UploadedFile() image): any {
        const layers = this.methodsService.getColorLayersRGB(image)
        return layers
    }

    @Post('charts-values/rgb')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    chartsValuesRGB(@UploadedFile() image): any {
        const charts = this.methodsService.getValuesForChartsRGB(image)
        return charts
    }

    @Post('charts-values/cmyk')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(200)
    chartsValuesCMYK(@UploadedFile() image): any {
        const charts = this.methodsService.getValuesForChartsCMYK(image)
        return charts
    }
}
