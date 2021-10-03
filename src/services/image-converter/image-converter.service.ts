import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageConverterService {

    imageRgb2cmyk(pixelData: any) {
        let cmykImageColorChannels = {
            arrChannelC: [],
            arrChannelM: [],
            arrChannelY: [],
            arrChannelK: []
        }
        for (let i = 0; i < pixelData.length; i += 4) {
            let newPixelCMYK = this.pixelRgb2cmyk(pixelData[i], pixelData[i + 1], pixelData[i + 2])
            cmykImageColorChannels.arrChannelC.push(Math.floor(newPixelCMYK.c))
            cmykImageColorChannels.arrChannelM.push(Math.floor(newPixelCMYK.m))
            cmykImageColorChannels.arrChannelY.push(Math.floor(newPixelCMYK.y))
            cmykImageColorChannels.arrChannelK.push(Math.floor(newPixelCMYK.k))
        }
        return cmykImageColorChannels
    }

    pixelRgb2cmyk(r, g, b, normalized?) {
        var c = 1 - (r / 255);
        var m = 1 - (g / 255);
        var y = 1 - (b / 255);
        var k = Math.min(c, Math.min(m, y));
    
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
    
        if(!normalized){
            c = Math.round(c * 10000) / 100;
            m = Math.round(m * 10000) / 100;
            y = Math.round(y * 10000) / 100;
            k = Math.round(k * 10000) / 100;
        }
        
        c = isNaN(c) ? 0 : c;
        m = isNaN(m) ? 0 : m;
        y = isNaN(y) ? 0 : y;
        k = isNaN(k) ? 0 : k;
        
        return {
            c: c,
            m: m,
            y: y,
            k: k
        }
    }
    
    pixelCmyk2rgb(c, m, y, k, normalized?){
        c = (c / 100);
        m = (m / 100);
        y = (y / 100);
        k = (k / 100);
        
        c = c * (1 - k) + k;
        m = m * (1 - k) + k;
        y = y * (1 - k) + k;
        
        var r = 1 - c;
        var g = 1 - m;
        var b = 1 - y;
        
        if (!normalized) {
        r = Math.round(255 * r);
        g = Math.round(255 * g);
        b = Math.round(255 * b);
        }
        
        return {
            r: r,
            g: g,
            b: b
        }
    }
}
