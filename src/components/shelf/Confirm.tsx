import type { ReactNode } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function Confirm({ trigger, title, body, ok, cancel, onOk, destructive }: {
  trigger: ReactNode; title: string; body: string; ok: string; cancel: string; onOk: () => void; destructive?: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onOk} variant={destructive ? 'destructive' : 'default'}>{ok}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
