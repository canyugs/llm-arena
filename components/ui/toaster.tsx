"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={3000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            onOpenChange={(open) => {
              // 處理手機版焦點問題，防止 toast 不會自動消失
              if (!open) {
                const viewport = document.getElementById("toast-viewport");

                if (viewport) {
                  viewport.blur();
                }
              }

              // 呼叫原本的 onOpenChange
              if (props.onOpenChange) {
                props.onOpenChange(open);
              }
            }}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport id="toast-viewport" />
    </ToastProvider>
  )
}
