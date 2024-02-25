export interface Product {
  name: string
  mainImage: string
  category: number
  images: Image[]
  description: string
  subDescription: string
  quantity: number
  price: number
}

export interface Image {
  color: string
  filePath: string
  caption: string
}
