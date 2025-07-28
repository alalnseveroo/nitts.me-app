
import * as React from "react"
import { cn } from "@/lib/utils"

export const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={cn("h-6 w-6", props.className)}
        {...props}
    >
        <path d="M21.282,6.472A8.414,8.414,0,0,0,12,2.83,8.223,8.223,0,0,0,8.465,4.51a5.6,5.6,0,0,0-3.929,3.228,5.845,5.845,0,0,0,1.9,7.039,5.553,5.553,0,0,0,6.6,1.4,12.5,12.5,0,0,0,1.986-1.554V18.1a4.8,4.8,0,1,1-9.589-1.554,1,1,0,1,0-2,0,6.8,6.8,0,1,0,13.582,1.554V9.655a1,1,0,0,0-1-1,8.328,8.328,0,0,1-1.986-.28A5.518,5.518,0,0,0,21.282,6.472Z"/>
    </svg>
)
