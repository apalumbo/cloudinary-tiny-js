import urlBuilder, { makeBaseUrl, compiler } from '../src/urlBuilder'
import imageParameters from '../src/imageParameters'

describe('urlBuilder', () => {
  describe('makeBaseUrl', () => {
    it('creates a secure Cloudinary URL with just a cloudName', () => {
      expect(makeBaseUrl({cloudName: 'demo'}, 'image', 'upload'))
        .toBe('https://res.cloudinary.com/demo/image/upload/')
    })

    it('handles advanced options', () => {
      expect(makeBaseUrl({
        cloudName: 'demo1',
        subDomain: 'test',
      }, 'video', 'upload')).toBe('https://test.cloudinary.com/demo1/video/upload/')
      expect(makeBaseUrl({
        cloudName: 'demo2',
        hostName: 'test.example.net',
        secure: false,
      }, 'image', 'fetch')).toBe('http://test.example.net/demo2/image/fetch/')
    })
  })

  describe('compiler', () => {
    it('creates a transform compiler given a parameter compiler', () => {
      const compile = compiler(imageParameters)
      expect(compile).toBeInstanceOf(Function)
      expect(compile).toHaveLength(1)
    })
    it('compiles a single transform with one or more parameters', () => {
      const compile = compiler(imageParameters)
      expect(compile({width: 220, height: 140, crop: 'fill'})).toBe('w_220,h_140,c_fill/')
    })
    it('compiles a single transform, applying and overriding default parameters', () => {
      const compile = compiler(imageParameters, {width: 'auto', height: 100, crop: 'fill'})
      expect(compile({height: 140, radius: 30})).toBe('w_auto,h_140,c_fill,r_30/')
    })
    it('compiles an array of transforms without applying defaults', () => {
      const compile = compiler(imageParameters, {width: 'auto', height: 100, crop: 'fill'})
      expect(compile([
        {width: 220, height: 140, crop: 'fill'},
        {overlay: 'brown_sheep', width: 220, height: 140, x: 220, crop: 'fill'},
        {overlay: 'horses', width: 220, height: 140, y: 140, x: -110, crop: 'fill'},
        {width: 400, height: 260, radius: 20, crop: 'crop'},
        {
          overlay: {text: 'Memories from our trip', fontFamily: 'Parisienne', fontSize: 35, fontWeight: 'bold'},
          color: '#990C47',
          y: 155
        },
        {effect: 'shadow'}
      ])).toBe('w_220,h_140,c_fill/l_brown_sheep,w_220,h_140,x_220,c_fill/l_horses,w_220,h_140,y_140,x_-110,c_fill/w_400,h_260,r_20,c_crop/l_text:Parisienne_35_bold:Memories%20from%20our%20trip,co_rgb:990C47,y_155/e_shadow/')
    })
  })

  describe('urlBuilder', () => {
    it('creates a url builder for a resource type given a parameter compiler and default transform', () => {
      const options = {cloudName: 'demo'}
      const imageUrlBuilder = urlBuilder(options)(imageParameters, {image: {width: 'auto', height: 100, crop: 'fill'}})
      expect(imageUrlBuilder).toBeInstanceOf(Function)
      const imageUrl = imageUrlBuilder('upload')
      expect(imageUrl).toBeInstanceOf(Function)
      expect(imageUrl('yellow_tulip.jpg', [
        {width: 220, height: 140, crop: "fill"},
        {overlay: "brown_sheep", width: 220, height: 140, x: 220, crop: "fill"},
        {overlay: "horses", width: 220, height: 140, y: 140, x: -110, crop: "fill"},
        {overlay: "white_chicken", width: 220, height: 140, y: 70, x: 110, crop: "fill"},
        {overlay: "butterfly.png", height: 200, x: -10, angle: 10},
        {width: 400, height: 260, radius: 20, crop: "crop"},
        {overlay: "text:Parisienne_35_bold:Memories%20from%20our%20trip", color: "#990C47", y: 155},
        {effect: "shadow"}
      ])).toBe(
        'https://res.cloudinary.com/demo/image/upload/w_220,h_140,c_fill/l_brown_sheep,w_220,h_140,c_fill,x_220/l_horses,w_220,h_140,c_fill,y_140,x_-110/l_white_chicken,w_220,h_140,c_fill,y_70,x_110/l_butterfly.png,h_200,x_-10,a_10/w_400,h_260,c_crop,r_20/l_text:Parisienne_35_bold:Memories from our trip,co_rgb:990C47,y_155/e_shadow/yellow_tulip.jpg'
      )
    })
  })
})