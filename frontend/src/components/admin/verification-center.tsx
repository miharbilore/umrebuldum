"use client"

import { useState } from "react"
import {
  ShieldCheck,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface PendingGuide {
  id: string
  name: string
  email: string
  phone: string
  location: string
  tursabNo: string
  submittedAt: string
  idPhotoUrl: string
  tursabDocUrl: string
  trustScore: number
}

const pendingGuides: PendingGuide[] = [
  {
    id: "G-001",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@email.com",
    phone: "+90 532 123 4567",
    location: "Istanbul, Turkey",
    tursabNo: "A-12345",
    submittedAt: "2 hours ago",
    idPhotoUrl: "/placeholder.svg?height=400&width=300",
    tursabDocUrl: "/placeholder.svg?height=400&width=300",
    trustScore: 85,
  },
  {
    id: "G-002",
    name: "Fatma Kaya",
    email: "fatma.kaya@email.com",
    phone: "+90 533 234 5678",
    location: "Ankara, Turkey",
    tursabNo: "B-23456",
    submittedAt: "5 hours ago",
    idPhotoUrl: "/placeholder.svg?height=400&width=300",
    tursabDocUrl: "/placeholder.svg?height=400&width=300",
    trustScore: 72,
  },
  {
    id: "G-003",
    name: "Mehmet Demir",
    email: "mehmet.demir@email.com",
    phone: "+90 534 345 6789",
    location: "Izmir, Turkey",
    tursabNo: "C-34567",
    submittedAt: "1 day ago",
    idPhotoUrl: "/placeholder.svg?height=400&width=300",
    tursabDocUrl: "/placeholder.svg?height=400&width=300",
    trustScore: 91,
  },
  {
    id: "G-004",
    name: "Ayşe Özkan",
    email: "ayse.ozkan@email.com",
    phone: "+90 535 456 7890",
    location: "Bursa, Turkey",
    tursabNo: "D-45678",
    submittedAt: "2 days ago",
    idPhotoUrl: "/placeholder.svg?height=400&width=300",
    tursabDocUrl: "/placeholder.svg?height=400&width=300",
    trustScore: 68,
  },
]

export function VerificationCenter() {
  const [selectedGuide, setSelectedGuide] = useState<PendingGuide | null>(pendingGuides[0])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Verification Center</CardTitle>
              <p className="text-sm text-muted-foreground">KYC & TURSAB Document Review</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {pendingGuides.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Left Panel - List */}
          <div className="w-80 shrink-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {pendingGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      selectedGuide?.id === guide.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
                          {guide.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{guide.name}</p>
                          <p className="text-xs text-muted-foreground">{guide.tursabNo}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {guide.submittedAt}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{guide.location}</span>
                      <span className={`text-xs font-medium ${getTrustScoreColor(guide.trustScore)}`}>
                        Trust: {guide.trustScore}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Details */}
          {selectedGuide && (
            <div className="flex-1">
              <div className="rounded-lg border bg-card">
                {/* Guide Info Header */}
                <div className="border-b p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                        {selectedGuide.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedGuide.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {selectedGuide.id}</p>
                      </div>
                    </div>
                    <div className={`text-right ${getTrustScoreColor(selectedGuide.trustScore)}`}>
                      <p className="text-3xl font-bold">{selectedGuide.trustScore}%</p>
                      <p className="text-xs">Trust Score</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGuide.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGuide.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGuide.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>TURSAB: {selectedGuide.tursabNo}</span>
                    </div>
                  </div>
                </div>

                {/* Document Review */}
                <div className="p-6">
                  <h4 className="mb-4 font-medium">Document Verification</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* ID Photo */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">ID Photo</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View Full
                        </Button>
                      </div>
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        <img
                          src={selectedGuide.idPhotoUrl}
                          alt="ID Photo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* TURSAB Document */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">TURSAB Document</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View Full
                        </Button>
                      </div>
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        <img
                          src={selectedGuide.tursabDocUrl}
                          alt="TURSAB Document"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 p-6">
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject with Reason
                  </Button>
                  <Button className="bg-success text-success-foreground hover:bg-success/90">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Guide
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedGuide?.name}&apos;s verification request.
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
            <Button variant="destructive" onClick={() => setRejectDialogOpen(false)}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
