
import * as React from "react"
import { cn } from "@/lib/utils"

export const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={cn("h-6 w-6", props.className)}
        {...props}
    >
        <path d="M23.495,6.2c-0.25-0.925-0.985-1.635-1.935-1.855C19.64,4.005,12,4.005,12,4.005s-7.64,0-9.56,0.34c-0.95,0.22-1.685,0.93-1.935,1.855C0.25,7.155,0,12,0,12s0.25,4.845,0.505,5.8c0.25,0.925,0.985,1.635,1.935,1.855C4.36,19.995,12,19.995,12,19.995s7.64,0,9.56-0.34c0.95-0.22,1.685-0.93,1.935-1.855C23.75,16.845,24,12,24,12S23.75,7.155,23.495,6.2z M9.545,15.565V8.435L15.82,12L9.545,15.565z"/>
    </svg>
)
