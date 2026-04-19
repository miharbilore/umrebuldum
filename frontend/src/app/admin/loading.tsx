import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* İstatistik Kartları Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-12 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* Action Center Skeleton */}
        <Card className="h-[400px]">
          <CardHeader className="pb-3 border-b mb-4">
             <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-12" />
             </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                 </div>
                 <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mali Defter Skeleton */}
        <Card className="h-[400px]">
          <CardHeader className="pb-3 border-b mb-4">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

       {/* Banner Engine / AI Stats Row Skeleton */}
       <div className="grid gap-6 lg:grid-cols-2">
          <Card className="h-[300px]">
             <CardHeader>
                <Skeleton className="h-6 w-32" />
             </CardHeader>
             <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
             </CardContent>
          </Card>
          <Card className="h-[300px]">
             <CardHeader>
                <Skeleton className="h-6 w-32" />
             </CardHeader>
             <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
             </CardContent>
          </Card>
       </div>
    </div>
  )
}
