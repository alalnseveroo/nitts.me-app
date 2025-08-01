import * as React from "react"
import { cn } from "@/lib/utils"

export const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("h-8 w-8", props.className)}
        {...props}
    >
        <defs>
            <radialGradient id="instagram-gradient" cx="0.3" cy="1" r="1">
                <stop offset="0" stopColor="#F5D02D"/>
                <stop offset="0.5" stopColor="#F53D2D"/>
                <stop offset="1" stopColor="#C13584"/>
            </radialGradient>
        </defs>
        <path d="M12,2C8.7,2,8.4,2,7.3,2.1c-1.1.1-1.8.3-2.5.6c-.6.3-1.2.7-1.7,1.2s-1,1.1-1.2,1.7c-.3.7-.5,1.4-.6,2.5C2,8.4,2,8.7,2,12s0,3.6.1,4.7c.1,1.1.3,1.8.6,2.5c.3.6.7,1.2,1.2,1.7s1.1,1,1.7,1.2c.7.3,1.4.5,2.5.6c1.1.1,1.4.1,4.7.1s3.6,0,4.7-.1c1.1-.1,1.8-.3,2.5-.6c.6-.3,1.2-.7,1.7-1.2s1-1.1,1.2-1.7c.3-.7.5-1.4.6-2.5c.1-1.1.1-1.4.1-4.7s0-3.6-.1-4.7c-.1-1.1-.3-1.8-.6-2.5c-.3-.6-.7-1.2-1.2-1.7s-1.1-1-1.7-1.2c-.7-.3-1.4-.5-2.5-.6C15.6,2,15.3,2,12,2z M12,4c3.2,0,3.5,0,4.7.1c1,.1,1.5.3,1.8.4.5.2.8.4,1.1.7.3.3.6.6.7,1.1.2.3.4.8.4,1.8.1,1.2.1,1.5.1,4.7s0,3.5-.1,4.7c-.1,1-.3,1.5-.4,1.8-.2.5-.4.8-.7,1.1-.3.3-.6.6-1.1.7-.3.2-.8.4-1.8.4-1.2.1-1.5.1-4.7.1s-3.5,0-4.7-.1c-1-.1-1.5-.3-1.8-.4-.5-.2-.8-.4-1.1-.7-.3-.3-.6-.6-.7-1.1-.2-.3-.4-.8-.4-1.8-.1-1.2-.1-1.5-.1-4.7s0-3.5.1-4.7c.1-1,.3-1.5.4-1.8.2-.5.4-.8.7-1.1.3-.3.6-.6,1.1-.7.3-.2.8-.4,1.8-.4C8.5,4,8.8,4,12,4z M12,7c-2.8,0-5,2.2-5,5s2.2,5,5,5,5-2.2,5-5S14.8,7,12,7z M12,15c-1.7,0-3-1.3-3-3s1.3-3,3-3,3,1.3,3,3S13.7,15,12,15z M16.5,6.5c-.6,0-1,.4-1,1s.4,1,1,1,1-.4,1-1S17.1,6.5,16.5,6.5z" fill="url(#instagram-gradient)" />
    </svg>
)
