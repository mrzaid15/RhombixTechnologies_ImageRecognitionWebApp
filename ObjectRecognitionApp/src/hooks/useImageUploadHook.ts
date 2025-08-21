import { useState  } from "react";
import axios from 'axios'
import { type Prediction , type useImageUploadResult } from "../types/type";

export const useImageUpload = (uploadUrl : string): useImageUploadResult => {
    const [prediction, setPredtiction] = useState<Prediction[] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const uploadImage = async (file:File) => {
        const formData = new FormData()
        formData.append("file",file)

        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post<Prediction[]>(uploadUrl, formData,{
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            console.log("Server Response:", response.data)
            if (Array.isArray(response.data) && response.data.length > 0){
                setPredtiction(response.data)
            }else{
                setError("Unexpected response fromat from server...")
            }
        } catch (error) {
            console.error("Error uploading the image", error)
            if (axios.isAxiosError(error)){
                setError(
                    `Failed to upload image: ${error.message}. Status: ${
                        error.response?.status}. ${error.response?.data?.detail || ""}
                    }`
                )
            }else {
                setError("Failed to upload image. Please try again..")
            }
        }finally{
            setIsLoading(false)
        }
    }

    return { uploadImage, prediction, isLoading, error}
}