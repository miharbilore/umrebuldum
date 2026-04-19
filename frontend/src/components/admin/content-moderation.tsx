"use client"

import { useState } from "react"
import {
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  DollarSign,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface TourListing {
  id: string
  title: string
  guide: string
  location: string
  price: number
  duration: string
  maxGroup: number
  rating: number
  imageUrl: string
  submittedAt: string
  description: string
}

const pendingListings: TourListing[] = [
  {
    id: "L-001",
    title: "Sacred Mecca Walking Tour",
    guide: "Ahmet Yılmaz",
    location: "Mecca, Saudi Arabia",
    price: 150,
    duration: "4 hours",
    maxGroup: 12,
    rating: 4.8,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "3 hours ago",
    description: "Experience the spiritual journey through the holy sites of Mecca with an expert guide.",
  },
  {
    id: "L-002",
    title: "Medina Historical Experience",
    guide: "Fatma Kaya",
    location: "Medina, Saudi Arabia",
    price: 120,
    duration: "3 hours",
    maxGroup: 10,
    rating: 4.9,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "5 hours ago",
    description: "Discover the rich history and sacred sites of Medina with our certified guide.",
  },
  {
    id: "L-003",
    title: "Istanbul Islamic Heritage",
    guide: "Mehmet Demir",
    location: "Istanbul, Turkey",
    price: 80,
    duration: "6 hours",
    maxGroup: 15,
    rating: 4.7,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "1 day ago",
    description: "Explore the magnificent mosques and Islamic history of Istanbul.",
  },
  {
    id: "L-004",
    title: "Jerusalem Old City Tour",
    guide: "Omar Abdullah",
    location: "Jerusalem",
    price: 200,
    duration: "8 hours",
    maxGroup: 8,
    rating: 5.0,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "1 day ago",
    description: "A comprehensive tour of the holiest sites in Jerusalem&apos;s Old City.",
  },
  {
    id: "L-005",
    title: "Konya Rumi Experience",
    guide: "Ayşe Özkan",
    location: "Konya, Turkey",
    price: 90,
    duration: "5 hours",
    maxGroup: 20,
    rating: 4.6,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "2 days ago",
    description: "Visit the tomb and museum of Mevlana Rumi in the spiritual heart of Turkey.",
  },
  {
    id: "L-006",
    title: "Cairo Islamic Quarter",
    guide: "Hassan Ali",
    location: "Cairo, Egypt",
    price: 70,
    duration: "4 hours",
    maxGroup: 12,
    rating: 4.5,
    imageUrl: "/placeholder.svg?height=200&width=300",
    submittedAt: "2 days ago",
    description: "Discover the ancient mosques and madrasas of Islamic Cairo.",
  },
]

export function ContentModeration() {
  const [selectedListing, setSelectedListing] = useState<TourListing | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Listings Moderation</CardTitle>
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {pendingListings.length} Awaiting Review
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingListings.map((listing) => (
            <div
              key={listing.id}
              className="group overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <Badge className="absolute left-3 top-3 bg-warning/90 text-warning-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {listing.submittedAt}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold leading-tight line-clamp-1">{listing.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{listing.guide}</p>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {listing.rating}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4 text-success" />
                      {listing.price}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {listing.maxGroup}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setSelectedListing(listing)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!selectedListing && !rejectDialogOpen} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.title}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedListing.guide} • {selectedListing.submittedAt}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={selectedListing.imageUrl}
                    alt={selectedListing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedListing.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${selectedListing.price} per person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max {selectedListing.maxGroup} people</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Listing
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{selectedListing?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRejectDialogOpen(false)
                setSelectedListing(null)
                setRejectReason("")
              }}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
