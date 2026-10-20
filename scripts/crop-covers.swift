import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let srcUrl = URL(fileURLWithPath: "/Users/deepakbhatt/.gemini/antigravity-ide/brain/cc9e315e-7ac3-4095-ab3d-ab67ec30d6c3/.user_uploaded/media_1792476844755.jpg")
guard let src = CGImageSourceCreateWithURL(srcUrl as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    print("Failed to load source image")
    exit(1)
}

let w = CGFloat(img.width)
let h = CGFloat(img.height)
let halfW = w / 2.0
let halfH = h / 2.0

let crops: [(name: String, rect: CGRect)] = [
    ("public/images/books/jlpt-n5-n4-cover.jpg", CGRect(x: 0, y: 0, width: halfW, height: halfH)),
    ("public/images/books/jlpt-n3-n2-n1-cover.jpg", CGRect(x: halfW, y: 0, width: halfW, height: halfH)),
    ("public/images/books/kanji-meaning-cover.jpg", CGRect(x: 0, y: halfH, width: halfW, height: halfH)),
    ("public/images/books/jlpt-mock-test-cover.jpg", CGRect(x: halfW, y: halfH, width: halfW, height: halfH))
]

for item in crops {
    if let cropped = img.cropping(to: item.rect) {
        let destUrl = URL(fileURLWithPath: item.name)
        guard let dest = CGImageDestinationCreateWithURL(destUrl as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else {
            print("Failed dest: \(item.name)")
            continue
        }
        let options: [CFString: Any] = [kCGImageDestinationLossyCompressionQuality: 0.95]
        CGImageDestinationAddImage(dest, cropped, options as CFDictionary)
        CGImageDestinationFinalize(dest)
        print("Successfully wrote \(item.name)")
    }
}
