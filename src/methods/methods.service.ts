import { Injectable } from '@nestjs/common';
import  * as fs from 'fs';
import { Canvas, createCanvas, createImageData, Image } from 'node-canvas';
import { HistoryService } from 'src/admin/history.service';
import { HistoryItemDto } from 'src/admin/historyDTO/history.dto';
import { ImageConverterService } from 'src/services/image-converter/image-converter.service';

@Injectable()
export class MethodsService {

    constructor(
        private imageConverter: ImageConverterService,
        private historyService: HistoryService
    ) {}

    methodIRGBResult(image: any, params: any) {
        let resultPixelDataArrayRGB: number[] = []
        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const levelsAmount = params.levels
        const choosenChannel = params.channel
        let levelsToRemove = []
        for (let i = 0; i < levelsAmount; i++) {
            levelsToRemove.push(this.randomUniqInt(0, 255, levelsToRemove))
        }
        resultPixelDataArrayRGB = [...pixelData.data]
        for (let i = 0; i < pixelData.data.length; i += 4) {
            let choosenChannelPixelValue: null | number = null
            let pixelColorIndex = 0
            switch(choosenChannel) {
                case 'r': pixelColorIndex = 0
                    break 
                case 'g': pixelColorIndex = 1
                    break
                case 'b': pixelColorIndex = 2
                    break
            }
            choosenChannelPixelValue = pixelData.data[i + pixelColorIndex] 
            if (levelsToRemove.includes(choosenChannelPixelValue)) resultPixelDataArrayRGB[i + pixelColorIndex]++
        }

        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(resultPixelDataArrayRGB)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        const newImageFile = new Image()
        newImageFile.src = newImageURI
        const charts = this.getValuesForChartsRGB(newImageFile, true)

        const linkImgBefore = this.saveLocal(imageUri, image.mimetype)
        const linkImgAfter = this.saveLocal(newImageURI, image.mimetype)
        this.addToHistory({
            linkImgBefore: linkImgBefore,
            linkImgAfter: linkImgAfter,
            date: new Date(),
            type: 'Изъятие нескольких уровней',
            info: '',
            user: 'me'
        })
        return {
            imageURI: newImageURI,
            charts: charts
        }
    }

    methodBCResult(image: any, params: any) {
        let resultsPixelDataArrayRGB: number[] = []

        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const barcode = params.code
        const choosenChannel = params.channel
        let levelsToRemove: any[] = [...barcode].map((barcodeNum, index) => {
            if (barcodeNum == 0) return index
            return null
        })
        
        let choosenChannelArray = []

        levelsToRemove = levelsToRemove.filter(barcodeNum => barcodeNum != null)
        resultsPixelDataArrayRGB = [...pixelData.data]
        for (let i = 0; i < resultsPixelDataArrayRGB.length; i += 4) {
            switch(params.channel) {
                case 'r':
                    choosenChannelArray.push(resultsPixelDataArrayRGB[i + 0])
                    break
                case 'g':
                    choosenChannelArray.push(resultsPixelDataArrayRGB[i + 1])
                    break
                case 'b':
                    choosenChannelArray.push(resultsPixelDataArrayRGB[i + 2])
                    break
            }
        }
        levelsToRemove.forEach((level) => {
            choosenChannelArray = choosenChannelArray.map(value => value == level ? value + 1 : value)
        })
        let resultPixelDataArrayRGB = []
        let index = 0
        for (let i = 0; i < resultsPixelDataArrayRGB.length; i += 4) {
            switch(params.channel) {
                case 'r':
                    resultPixelDataArrayRGB.push(choosenChannelArray[index], resultsPixelDataArrayRGB[i + 1], resultsPixelDataArrayRGB[i + 2], resultsPixelDataArrayRGB[i + 3])
                    break
                case 'g':
                    resultPixelDataArrayRGB.push(resultsPixelDataArrayRGB[i + 0], choosenChannelArray[index], resultsPixelDataArrayRGB[i + 2], resultsPixelDataArrayRGB[i + 3])
                    break
                case 'b':
                    resultPixelDataArrayRGB.push(resultsPixelDataArrayRGB[i + 0], resultsPixelDataArrayRGB[i + 1], choosenChannelArray[index], resultsPixelDataArrayRGB[i + 3])
                    break
            }
            index++
        }
        // for (let i = 0; i < pixelData.data.length; i += 4) {
        //     let choosenChannelPixelValue: null | number = null
        //     let pixelColorIndex = 0
        //     switch(choosenChannel) {
        //         case 'r': pixelColorIndex = 0
        //             break 
        //         case 'g': pixelColorIndex = 1
        //             break
        //         case 'b': pixelColorIndex = 2
        //             break
        //     }
        //     choosenChannelPixelValue = pixelData.data[i + pixelColorIndex] 
        //     if (levelsToRemove.includes(choosenChannelPixelValue)) resultPixelDataArrayRGB[i + pixelColorIndex]++
        // }

        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(resultPixelDataArrayRGB)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        const newImageFile = new Image()
        newImageFile.src = newImageURI
        const charts = this.getValuesForChartsRGB(newImageFile, true)

        const linkImgBefore = this.saveLocal(imageUri, image.mimetype)
        const linkImgAfter = this.saveLocal(newImageURI, image.mimetype)
        this.addToHistory({
            linkImgBefore: linkImgBefore,
            linkImgAfter: linkImgAfter,
            date: new Date(),
            type: 'Введение штрихового кода',
            info: '',
            user: 'me'
        })
        return {
            imageURI: newImageURI,
            charts: charts
        }
    }

    methodQRResult(image: any, code: any, params: any) {
        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri
        const canvasImage = createCanvas(imageFile.width, imageFile.height)
        let ctxImage = canvasImage.getContext('2d')
        ctxImage.drawImage(imageFile, 0, 0)
        const imagePixelData = ctxImage.getImageData(0, 0, imageFile.width, imageFile.height)

        const codeUri = this.bufferToUri(code.buffer) 
        const codeFile = new Image()
        codeFile.src = codeUri
        const canvasCode = createCanvas(codeFile.width, codeFile.height)
        let ctxCode = canvasCode.getContext('2d')
        ctxCode.drawImage(codeFile, 0, 0)
        const codePixelData = ctxCode.getImageData(0, 0, codeFile.width, codeFile.height)

        const codeData = codePixelData.data
        const startX = params.codePosition.x
        const startY = params.codePosition.y
        const codeHeight = codeFile.height
        const codeWidth = codeFile.width

        let choosenChannelArray = []
        const newImagePixelData = [...imagePixelData.data]
        
        for (let i = 0; i < newImagePixelData.length; i += 4) {
            switch(params.channel) {
                case 'r':
                    choosenChannelArray.push(newImagePixelData[i + 0])
                    break
                case 'g':
                    choosenChannelArray.push(newImagePixelData[i + 1])
                    break
                case 'b':
                    choosenChannelArray.push(newImagePixelData[i + 2])
                    break
            }
        }

        let c = 0
        for (let y = startY; y < (startY + codeHeight); y++) {
            for (let x = startX; x < (startX + codeWidth); x++) {
                if (codeData[c] == 0 && codeData[c + 1] == 0 && codeData[c + 2] == 0) {
                    choosenChannelArray[imageFile.width * y + x] = 255
                }
                c += 4
            }
        }
        let newImageDataArray = []
        let index = 0
        for (let i = 0; i < newImagePixelData.length; i += 4) {
            switch(params.channel) {
                case 'r':
                    newImageDataArray.push(choosenChannelArray[index], newImagePixelData[i + 1], newImagePixelData[i + 2], newImagePixelData[i + 3])
                    break
                case 'g':
                    newImageDataArray.push(newImagePixelData[i + 0], choosenChannelArray[index], newImagePixelData[i + 2], newImagePixelData[i + 3])
                    break
                case 'b':
                    newImageDataArray.push(newImagePixelData[i + 0], newImagePixelData[i + 1], choosenChannelArray[index], newImagePixelData[i + 3])
                    break
            }
            index++
        }

        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(newImageDataArray)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctxImage.putImageData(newimageData, 0, 0)
        const newImageURI = canvasImage.toDataURL()
        
        const linkImgBefore = this.saveLocal(imageUri, image.mimetype)
        const linkImgAfter = this.saveLocal(newImageURI, image.mimetype)
        const linkCode = this.saveLocal(codeUri, image.mimetype)
        this.addToHistory({
            linkImgBefore: linkImgBefore,
            linkImgAfter: linkImgAfter,
            date: new Date(),
            type: 'Введение QR кода',
            info: linkCode,
            user: 'me'
        })
        return {
            imageURI: newImageURI,
        }
    }

    methodI2030Result(image: any, params: any) {
        let resultPixelDataArrayRGB: number[] = []

        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const channelArraysCMYK = this.imageConverter.imageRgb2cmyk(pixelData.data)

        const min = Math.floor(Math.random() * (50 - 0))
        const max = min + +(params.codeNum)
        for (let i = min; i < max; i++) {
            channelArraysCMYK.arrChannelY.forEach((n, index, arr) => {
                if (n == i) {
                    arr[index] = 0
                }
            })
        }

        for (let i = 0; i < channelArraysCMYK.arrChannelC.length; i++) {
            const newPixelRGB = this.imageConverter.pixelCmyk2rgb(channelArraysCMYK.arrChannelC[i], channelArraysCMYK.arrChannelM[i], channelArraysCMYK.arrChannelY[i], channelArraysCMYK.arrChannelK[i])
            resultPixelDataArrayRGB.push(newPixelRGB.r, newPixelRGB.g, newPixelRGB.b, 255)
        }
        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(resultPixelDataArrayRGB)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        const newImageFile = new Image()
        newImageFile.src = newImageURI
        const charts = this.getValuesForChartsCMYK(newImageFile, true)

        const linkImgBefore = this.saveLocal(imageUri, image.mimetype)
        const linkImgAfter = this.saveLocal(newImageURI, image.mimetype)
        this.addToHistory({
            linkImgBefore: linkImgBefore,
            linkImgAfter: linkImgAfter,
            date: new Date(),
            type: 'Изъятие 20-30 уровней',
            info: '',
            user: 'me'
        })
        return {
            imageURI: newImageURI,
            charts: charts
        }
    }

    methodFLUPreview(image: any, params: any) {
        let resultPixelDataArrayRGB: number[] = []

        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const channelArraysCMYK = this.imageConverter.imageRgb2cmyk(pixelData.data)

        const min = Math.floor(Math.random() * (50 - 0))
        const max = min + +(params.codeNum)
        for (let i = min; i < max; i++) {
            channelArraysCMYK.arrChannelY.forEach((n, index, arr) => {
                if (n == i) {
                    arr[index] = 0
                }
            })
        }

        for (let i = 0; i < channelArraysCMYK.arrChannelC.length; i++) {
            const newPixelRGB = this.imageConverter.pixelCmyk2rgb(channelArraysCMYK.arrChannelC[i], channelArraysCMYK.arrChannelM[i], channelArraysCMYK.arrChannelY[i], channelArraysCMYK.arrChannelK[i])
            resultPixelDataArrayRGB.push(newPixelRGB.r, newPixelRGB.g, newPixelRGB.b, 255)
        }
        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(resultPixelDataArrayRGB)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        const newImageFile = new Image()
        newImageFile.src = newImageURI
        const charts = this.getValuesForChartsCMYK(newImageFile, true)
        return {
            imageURI: newImageURI,
            charts: charts
        }
    }

    methodFLUResult(image: any, params: any) {
        let resultPixelDataArrayRGB: number[] = []

        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const channelArraysCMYK = this.imageConverter.imageRgb2cmyk(pixelData.data)

        const min = Math.floor(Math.random() * (50 - 0))
        const max = min + +(params.codeNum)
        for (let i = min; i < max; i++) {
            channelArraysCMYK.arrChannelY.forEach((n, index, arr) => {
                if (n == i) {
                    arr[index] = 0
                }
            })
        }

        for (let i = 0; i < channelArraysCMYK.arrChannelC.length; i++) {
            const newPixelRGB = this.imageConverter.pixelCmyk2rgb(channelArraysCMYK.arrChannelC[i], channelArraysCMYK.arrChannelM[i], channelArraysCMYK.arrChannelY[i], channelArraysCMYK.arrChannelK[i])
            resultPixelDataArrayRGB.push(newPixelRGB.r, newPixelRGB.g, newPixelRGB.b, 255)
        }
        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(resultPixelDataArrayRGB)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        const newImageFile = new Image()
        newImageFile.src = newImageURI
        const charts = this.getValuesForChartsCMYK(newImageFile, true)
        return {
            imageURI: newImageURI,
            charts: charts
        }
    }

    getValuesForChartsRGB(image: any, isImageURI?: boolean) {
        let charts = {
            chartR: [],
            chartG: [],
            chartB: []
        }

        let imageFile: any
        if (!isImageURI) {
            const imageUri = this.bufferToUri(image.buffer) 
            imageFile = new Image()
            imageFile.src = imageUri
        }
        else {
            imageFile = image
        }

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        for (let i = 0; i <= 255; i++) {
            charts.chartR[i] = 0
            charts.chartG[i] = 0
            charts.chartB[i] = 0
        }
        const pixelDataArray = pixelData.data
        for (let i = 0; i < pixelDataArray.length; i += 4) {
            const valueR = pixelDataArray[i] 
            const valueG = pixelDataArray[i + 1] 
            const valueB = pixelDataArray[i + 2]
            charts.chartR[valueR]++
            charts.chartG[valueG]++
            charts.chartB[valueB]++
        }
        return charts
    }

    getValuesForChartsCMYK(image: any, isImageURI?: boolean) {
        let charts = {
            chartC: [],
            chartM: [],
            chartY: [],
            chartK: [],
        }

        let imageFile: any
        if (!isImageURI) {
            const imageUri = this.bufferToUri(image.buffer) 
            imageFile = new Image()
            imageFile.src = imageUri
        }
        else {
            imageFile = image
        }

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        for (let i = 0; i <= 100; i++) {
            charts.chartC[i] = 0
            charts.chartM[i] = 0
            charts.chartY[i] = 0
            charts.chartK[i] = 0
        }
        const pixelDataArray = pixelData.data
        for (let i = 0; i < pixelDataArray.length; i += 4) {
            const pixelValuesCMYK = this.imageConverter.pixelRgb2cmyk(pixelDataArray[i], pixelDataArray[i + 1], pixelDataArray[i + 2])
            const valueC = Math.floor(pixelValuesCMYK.c)
            const valueM = Math.floor(pixelValuesCMYK.m)
            const valueY = Math.floor(pixelValuesCMYK.y)
            const valueK = Math.floor(pixelValuesCMYK.k)
            charts.chartC[valueC]++
            charts.chartM[valueM]++
            charts.chartY[valueY]++
            charts.chartK[valueK]++
        }
        return charts
    }

    getColorLayersRGB(image) {
        let colorLayerR = []
        let colorLayerG = []
        let colorLayerB = []

        const imageUri = this.bufferToUri(image.buffer) 
        const imageFile = new Image()
        imageFile.src = imageUri

        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(imageFile, 0, 0)
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let newPixelData = [...pixelData.data]

        for (let i = 0; i < pixelData.data.length; i += 4) {
            colorLayerR.push(newPixelData[i + 0], 0, 0, newPixelData[i + 3])
            colorLayerG.push(0, newPixelData[i + 1], 0, newPixelData[i + 3])
            colorLayerB.push(0, 0, newPixelData[i + 2], newPixelData[i + 3])
        }

        const colorLayerURIR = this.pixelDataArrayToURI(colorLayerR, imageFile)
        const colorLayerURIG = this.pixelDataArrayToURI(colorLayerG, imageFile)
        const colorLayerURIB = this.pixelDataArrayToURI(colorLayerB, imageFile)
        
        return {
            colorLayerURIR,
            colorLayerURIG,
            colorLayerURIB
        } 
    }

    pixelDataArrayToURI(pixelDataArray: number[], imageFile: Image) {
        const canvas = createCanvas(imageFile.width, imageFile.height)
        let ctx = canvas.getContext('2d')
        const resultPixelDataRGBU8CA: Uint8ClampedArray = Uint8ClampedArray.from(pixelDataArray)
        const newimageData = createImageData(resultPixelDataRGBU8CA, imageFile.width)
        ctx.putImageData(newimageData, 0, 0)
        const newImageURI = canvas.toDataURL()
        return newImageURI
    }

    bufferToUri(buffer: Buffer) {
        const mime = 'image/png'; 
        const encoding = 'base64'; 
        const data = buffer.toString(encoding)
        return 'data:' + mime + ';' + encoding + ',' + data; 
    }

    randomUniqInt(min, max, arr) {
        let newRandomInt = min + Math.floor((max - min) * Math.random())
        if (!arr.includes(newRandomInt)) return newRandomInt
        this.randomUniqInt(min, max, arr)
    }

    saveLocal(dataUri, encoding) {
        const parseDataUrl = require('parse-data-url')
        const contentTypeMap = {
            'image/png': 'png',
            'image/jpeg': 'jpg'
        }
        const parsed = parseDataUrl(dataUri).toBuffer()
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
        console.log(encoding)
        const fileExt = contentTypeMap[encoding]
        const filename = new Date().getTime().toString() + '_file'
        const fullFilePath = `${dir}/${filename}.${fileExt}`
        fs.writeFileSync(fullFilePath, parsed)
        return `${filename}.${fileExt}`
    }

    addToHistory(historyItem: HistoryItemDto) {
        this.historyService.addToHistory(historyItem)
    }

    ////////////

    // findEdges(blurRadius, trasholdL, trasholdU) {
    //     this.imageBlur(blurRadius)
    //     this.findGradients()
    //     this.nonmaximumRemove()
    //     this.trasholds(trasholdL, trasholdU)
    //     this.removeExp()
    //   }
    
    // findPixel(oY, oX) {
    //     const c = this.arrChannelC[this.picParams.width * oY + oX]
    //     const m = this.arrChannelM[this.picParams.width * oY + oX]
    //     const y = this.arrChannelY[this.picParams.width * oY + oX]
    //     const k = this.arrChannelK[this.picParams.width * oY + oX]
    //     return {c, m, y, k}
    // }
    
    // findSquare(pixelIndedex, radius) {
    //     const rawY = Math.floor(pixelIndedex / this.picParams.width)
    //     const rawX = pixelIndedex % this.picParams.width
    //     let startX = rawX - radius
    //     let endX = rawX + radius
    //     let startY = rawY - radius
    //     let endY = rawY +  radius
    //     if (startX < 0) {
    //       startX = 0
    //     }
    //     if (endX >= this.picParams.width) {
    //       endX = this.picParams.width - 1
    //     }
    //     if (startY < 0) {
    //       startY = 0
    //     }
    //     if (endY >= this.picParams.height) {
    //       endY = this.picParams.height - 1
    //     }
    //     return {startX, endX, startY, endY}
    // }
    
    // imageBlur(blurRadius) {
    //     let newPixelArrY = []
    //     this.newImageArray = []
    //     this.blurChannelArr = []
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let square = this.findSquare(i, blurRadius)
    //       let pixelCount = 0 
    //       newPixelArrY = []
    //       for (let y = square.startY; y <= square.endY; y++) {
    //         for (let p = (this.picParams.width * y + square.startX); p <= (this.picParams.width * y + square.endX); p++) {
    //           newPixelArrY.push(this.arrChannelY[p])
    //           pixelCount++
    //         }
    //       }
    //       this.blurChannelArr[i] = Math.floor(newPixelArrY.reduce((sum, element) => sum + element, 0) / pixelCount)
    //     }
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.blurChannelArr[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    // }
    
    // findGradients() {
    //     let newPixelArrY = []
    //     let gradientArrX = []
    //     let gradientArrY = []
    //     let matrixX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    //     let matrixY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    //     this.newImageArray = []
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let square = this.findSquare(i, 1)
    //       let pixelCount = 0 
    //       newPixelArrY = []
    //       for (let y = square.startY; y <= square.endY; y++) {
    //         for (let p = (this.picParams.width * y + square.startX); p <= (this.picParams.width * y + square.endX); p++) {
    //           newPixelArrY.push(this.blurChannelArr[p])
    //           pixelCount++
    //         }
    //       }
    //       if (newPixelArrY.length < 9) {
    //         this.gradientsChannelArr[i] = 1
    //         this.grandientAngles[i] = 404
    //       }
    //       else {
    //         let sumX = 0
    //         let sumY = 0
    //         newPixelArrY.forEach((pix, index) => {
    //           sumX += pix * matrixX[index]
    //           sumY += pix * matrixY[index]
    //         })
    //         gradientArrX[i] = Math.floor(sumX)
    //         gradientArrY[i] = Math.floor(sumY)
    //         this.gradientsChannelArr[i] = Math.floor(Math.sqrt(Math.pow(gradientArrX[i], 2) + Math.pow(gradientArrY[i], 2)))
    //         this.grandientAngles[i] = (Math.atan2(Math.floor(sumY), Math.floor(sumX)) * 180) / Math.PI
    //       }
    //       if (this.gradientsChannelArr[i] == 0) {
    //         this.grandientAngles[i] = 404
    //       }
    //     }
    //     // console.log(this.gradientsChannelArr, 'XXXX', this.grandientAngles)
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.gradientsChannelArr[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    // }
    
    
    
    // nonmaximumRemove() {
    //     // let cyanHUI = []
    //     // let magHUI = []
    //     // let yellowHUI = []
    //     // let bHUI = []
    
    //     let max = {elm: 0, index: 0, gradient: -1}
    //     let newPixelArrY = []
    //     // let newOfAngelArr = []
    //     this.nonmaxChannelArr = []
    //     this.newImageArray = []
    //     this.arrChannelY.forEach((n, i) => this.nonmaxChannelArr[i] = 0)
    //     // let forgottenArr = []
    
    //     // this.arrChannelY.forEach((n, i) => {
    //     //   cyanHUI[i] = 0
    //     //   magHUI[i] = 0
    //     //   yellowHUI[i] = 0
    //     //   bHUI[i] = 0
    //     // })
    
    //     this.grandientAngles = this.grandientAngles.map((p, s) => {
    //       if (p > -23 && p <= 22 || (p > 159 && p <= 180) || p < -159) {
    //         // cyanHUI[s] = 255
    //         return 0
    //       }
    //       else if ((p > 23 && p <= 69) || (p <= -114 && p > -159)) {
    //         // magHUI[s] = 255
    //         return 135
    //       }
    //       else if ((p > 69 && p <= 114) || (p <= -69 && p > -114)) {
    //         // yellowHUI[s] = 255
    //         return 90
    //       }
    //       else if (p > 114 && p <= 159 || p <= -23 && p > -69) {
    //         // bHUI[s] = 255
    //         return 45
    //       }
    //       else {
    //         return 404
    //       }
    //     })
    
    //     // console.log(this.grandientAngles)
    //     // for (let i = 0; i < this.arrChannelY.length; i++) {
    //     //   this.newImageArray.push(cyanHUI[i], magHUI[i], yellowHUI[i], 255)
    //     // }
    
    
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    
        
    
    //       // if (!forgottenArr.includes(i)) {
    //       if (this.grandientAngles[i] != 404) {
    //         // console.log('fhfgj')
    //         newPixelArrY = []
    //         let lineNewPixAngleIndex = i
    //         let lineNewPixAngle = this.grandientAngles[i]
    //         const qGrandientAngle = this.grandientAngles[i]
    //         while (lineNewPixAngle == qGrandientAngle) {
    //           let rawY = Math.floor(lineNewPixAngleIndex / this.picParams.width)
    //           let rawX = lineNewPixAngleIndex % this.picParams.width
    //           // console.log('XYYYYYIXWAW', rawX, rawY, lineNewPixAngle)
    //           newPixelArrY.push({elm: this.gradientsChannelArr[lineNewPixAngleIndex], index: lineNewPixAngleIndex, gradient: lineNewPixAngle})
              
    //           // forgottenArr.push(lineNewPixAngleIndex)
    
    //           let newY
    //           let newX
    //           switch(this.grandientAngles[lineNewPixAngleIndex]) {
    //             case 0: 
    //               newY = rawY
    //               newX = rawX + 1
    //               break
    //             case 45: 
    //               newY = rawY + 1
    //               newX = rawX - 1
    //               break
    //             case 90:
    //               newY = rawY + 1
    //               newX = rawX
    //               break
    //             case 135:
    //               newY = rawY + 1
    //               newX = rawX + 1
    //               break 
    //           }
    //           this.grandientAngles[lineNewPixAngleIndex] = 404
    //           // if ((newX <= 0) || (newX >= (this.picParams.width - 1)) || (newY <= 0) || (newY >= (this.picParams.height - 1))) {
    //           //   break
    //           // }
    //           lineNewPixAngle = this.grandientAngles[this.picParams.width * newY + newX]
    //           // console.log('HUI', lineNewPixAngleIndex, newX, newY)
    //           lineNewPixAngleIndex = this.picParams.width * newY + newX
    //           // console.log('XXX', qGrandientAngle, lineNewPixAngle, lineNewPixAngleIndex)
    //         }
    //         max = newPixelArrY[0];
    //         for (let i = 0; i < newPixelArrY.length; i++) {
    //           if (newPixelArrY[i].elm > max.elm) {
    //             max = newPixelArrY[i]
    //           }
    //         }
            
    //         // newPixelArrY.forEach(n => {
    //         //   if (newPixelArrY[n.index] < max.elm) {
    //         //     this.nonmaxChannelArr[n.index] = 0
    //         //   }
    //         // })
    //         this.nonmaxChannelArr[max.index] = max.elm
    //       }
    //     }
    //     // console.log(this.nonmaxChannelArr)
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.nonmaxChannelArr[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    
    
    
    
    
    //     //     // console.log(newPixelArrY)
    //     //     max = newPixelArrY[0];
    //     //     for (let i = 0; i < newPixelArrY.length; i++) {
    //     //       if (newPixelArrY[i].elm > max.elm) {
    //     //         max = newPixelArrY[i]
    //     //       }
    //     //     }
    //     //     newPixelArrY.forEach(n => {
    //     //       if (newPixelArrY[n.index] <= max.elm) {
    //     //         this.nonmaxChannelArr[n.index] = 0
    //     //       }
    //     //     })
    //     //     this.nonmaxChannelArr[max.index] = max.elm
    //     //   }
    //     // }
    //     // for (let i = 0; i < this.arrChannelY.length; i++) {
    //     //   let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.nonmaxChannelArr[i])
    //     //   this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     // }
    
    //     // this.nonmaxChannelArr = this.gradientsChannelArr
    
    //       // let square = this.findSquare(i, 1)
    //       // newPixelArrY = []
    //       // for (let y = square.startY; y <= square.endY; y++) {
    //       //   for (let p = (this.picParams.width * y + square.startX); p <= (this.picParams.width * y + square.endX); p++) {
    //       //     newPixelArrY.push({elm: this.gradientsChannelArr[p], index: p, gradient: this.grandientAngles[p]})
    //       //   }
    //       // }
    //       // if (newPixelArrY.length < 9) {
    //       //   newPixelArrY = []
    //       //   for (let i = 0; i < 9; i++) {
    //       //     newPixelArrY.push({elm: 1, index: i, gradient: -1})
    //       //   }
    //       // }
    //       // switch(this.grandientAngles[i]) {
    //       //   case 0: 
    //       //     newOfAngelArr = [newPixelArrY[3], newPixelArrY[4], newPixelArrY[5]]
    //       //     newOfAngelArr = newOfAngelArr.filter(n => n.gradient == 0)
    //       //     if (newOfAngelArr.length == 0) {
    //       //       newOfAngelArr = [{elm: 0, index: i, gradient: -1}]
    //       //     }
    //       //     break
    //       //   case 45: 
    //       //     newOfAngelArr = [newPixelArrY[2], newPixelArrY[4], newPixelArrY[6]]
    //       //     newOfAngelArr = newOfAngelArr.filter(n => n.gradient == 45)
    //       //     break
    //       //   case 90: 
    //       //     newOfAngelArr = [newPixelArrY[1], newPixelArrY[4], newPixelArrY[7]]
    //       //     newOfAngelArr = newOfAngelArr.filter(n => n.gradient == 90)
    //       //     break
    //       //   case 135: 
    //       //     newOfAngelArr = [newPixelArrY[0], newPixelArrY[4], newPixelArrY[8]]
    //       //     newOfAngelArr = newOfAngelArr.filter(n => n.gradient == 135)
    //       //     break
    //       //   default: 
    //       //     newOfAngelArr = [{elm: 0, index: i, gradient: -1}]
    //       // }
    //       // max = newOfAngelArr[0];
    //   }
    
    // trasholds(lowLimit, upLimit) {
    //     this.trasholdsChannelArr = []
    //     this.newImageArray = []
    //     this.expsArr = []
    //     this.nonmaxChannelArr.forEach((v, i) => {
    //       if (v > upLimit) {
    //         this.trasholdsChannelArr[i] = 100
    //       }
    //       if (v < lowLimit) {
    //         this.trasholdsChannelArr[i] = 0
    //       }
    //       if (v > lowLimit && v < upLimit) {
    //         this.trasholdsChannelArr[i] = 50
    //         this.expsArr.push(i)
    //       }
    //     })
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.trasholdsChannelArr[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    // }
    
    // removeExp() {
    //     let newPixelYSum 
    //     this.expsArr.forEach(i => {
    //       let square = this.findSquare(i, 1)
    //       newPixelYSum = 0
    //       for (let y = square.startY; y <= square.endY; y++) {
    //         for (let p = (this.picParams.width * y + square.startX); p <= (this.picParams.width * y + square.endX); p++) {
    //           newPixelYSum += this.trasholdsChannelArr[p]
    //         }
    //       }
    //       if (this.trasholdsChannelArr[i] == newPixelYSum) {
    //         this.trasholdsChannelArr[i] = 0
    //       }
    //       else {
    //         this.trasholdsChannelArr[i] = 100
    //       }
    //     })
    //     this.newFLUchannel = this.trasholdsChannelArr
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       let newPixel = this.rgbCmykService.cmyk2rgb(0, 0, 0, this.trasholdsChannelArr[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    // }
    
    // generateFLUImage() {
    //     let currentPixC
    //     this.newImageArray = []
    //     for (let i = 0; i < this.arrChannelY.length; i++) {
    //       if (this.newFLUchannel[i] == 0) {
    //         currentPixC = this.arrChannelY[i]
    //       }
    //       else {
    //         currentPixC = this.newFLUchannel[i]
    //       }
    //       let newPixel = this.rgbCmykService.cmyk2rgb(this.arrChannelC[i], this.arrChannelM[i], currentPixC, this.arrChannelK[i])
    //       this.newImageArray.push(newPixel.r, newPixel.g, newPixel.b, 255)
    //     }
    // }

}
