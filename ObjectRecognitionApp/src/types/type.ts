export type Prediction = {
    category: string
    score: number
}

export type useImageUploadResult = {
    uploadImage: (file: File) => Promise<void>
    prediction: Prediction[] | null
    isLoading: boolean 
    error: string | null 
}