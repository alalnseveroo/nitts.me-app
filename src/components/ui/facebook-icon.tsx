import * as React from "react"
import { cn } from "@/lib/utils"

export const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("h-8 w-8", props.className)}
        {...props}
    >
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM16.5 8.25h-2.1c-.55 0-1.1.55-1.1 1.1v1.38h3.2l-.44 2.75h-2.76V20h-3.3V13.48H8.5V10.73h2.1V9.08c0-2.1 1.25-3.3 3.3-3.3h2.6v2.47z"/>
    </svg>
)
