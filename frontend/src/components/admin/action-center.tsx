"use client"

import { useState } from "react"
import { Check, X, ExternalLink, FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SmartAvatar } from "@/components/ui/smart-avatar"

interface PendingListing {
  id: string
  title: string
  guideName: string
  guideImage?: string | null
  submittedAt: string
  category: string
}

interface PendingGuide {
  id: string
  name: string
  image?: string | null
  email: string
  submittedAt: string
}

interface ActionCenterProps {
  pendingListings: PendingListing[]
  pendingGuides: PendingGuide[]
}

export function ActionCenter({ pendingListings, pendingGuides }: ActionCenterProps) {
  const [activeTab, setActiveTab] = useState("listings")

  const handleApprove = (id: string, type: string) => {
    console.log(`Approved ${type}: ${id}`)
  }

  const handleReject = (id: string, type: string) => {
    console.log(`Rejected ${type}: ${id}`)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          Acil Aksiyon Bekleyenler
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {pendingListings.length + pendingGuides.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings" className="gap-2">
              <FileText className="h-4 w-4" />
              İlan Onayları
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                {pendingListings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2">
              <Star className="h-4 w-4" />
              Rehber Doğrulamaları
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                {pendingGuides.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-4">
            <div className="overflow-x-auto">
              <div className="min-w-[400px] space-y-3">
                {pendingListings.length > 0 ? (
                  pendingListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <SmartAvatar 
                          src={listing.guideImage} 
                          name={listing.guideName} 
                          size={32} 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{listing.title}</p>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {listing.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {listing.guideName} &bull; {listing.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-success hover:bg-success/10"
                          onClick={() => handleApprove(listing.id, "listing")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(listing.id, "listing")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Onay bekleyen ilan bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="mt-4">
            <div className="overflow-x-auto">
              <div className="min-w-[400px] space-y-3">
                {pendingGuides.length > 0 ? (
                  pendingGuides.map((guide) => (
                    <div
                      key={guide.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <SmartAvatar 
                          src={guide.image} 
                          name={guide.name} 
                          size={32} 
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{guide.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {guide.email} &bull; {guide.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-success hover:bg-success/10"
                          onClick={() => handleApprove(guide.id, "guide")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(guide.id, "guide")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Onay bekleyen rehber bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
