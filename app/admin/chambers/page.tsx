"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Eye, Edit, CheckCircle, Clock } from "lucide-react"
import { ChamberDetailsModal } from "@/components/admin/chamber-details-modal"
import { CreateChamberModal } from "@/components/admin/create-chamber-modal"
import { VerifyChamberModal } from "@/components/admin/verify-chamber-modal"

// Mock data - replace with actual API calls
const mockChambers = [
  {
    id: "1",
    doctorId: "doc1",
    pharmacyId: "pharm1",
    doctor: {
      name: "Dr. Sarah Johnson",
      specialization: "Cardiology",
    },
    pharmacy: {
      name: "MedPlus Pharmacy",
      address: "123 Health Street",
    },
    weekNumber: "FIRST",
    weekDay: "MONDAY",
    startTime: "09:00",
    endTime: "12:00",
    fees: 500,
    slotDuration: 30,
    maxSlots: 6,
    isActive: true,
    isVerified: true,
    verificationDate: "2024-01-15",
    verificationNotes: "All documents verified",
    totalAppointments: 45,
    revenue: 22500,
    rating: 4.8,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    doctorId: "doc2",
    pharmacyId: "pharm2",
    doctor: {
      name: "Dr. Michael Chen",
      specialization: "Neurology",
    },
    pharmacy: {
      name: "Apollo Pharmacy",
      address: "456 Wellness Avenue",
    },
    weekNumber: "SECOND",
    weekDay: "WEDNESDAY",
    startTime: "14:00",
    endTime: "17:00",
    fees: 750,
    slotDuration: 45,
    maxSlots: 4,
    isActive: true,
    isVerified: false,
    verificationDate: null,
    verificationNotes: null,
    totalAppointments: 12,
    revenue: 9000,
    rating: 4.6,
    createdAt: "2024-01-20",
  },
]

export default function ChambersPage() {
  const [chambers, setChambers] = useState(mockChambers)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [pharmacyFilter, setPharmacyFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedChamber, setSelectedChamber] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [verifyingChamber, setVerifyingChamber] = useState(null)

  const filteredChambers = chambers.filter((chamber) => {
    const matchesSearch =
      chamber.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamber.pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamber.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && chamber.isVerified) ||
      (verificationFilter === "pending" && !chamber.isVerified)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && chamber.isActive) ||
      (statusFilter === "inactive" && !chamber.isActive)

    return matchesSearch && matchesVerification && matchesStatus
  })

  const verifiedChambers = chambers.filter((c) => c.isVerified).length
  const pendingChambers = chambers.filter((c) => !c.isVerified).length
  const activeChambers = chambers.filter((c) => c.isActive).length
  const totalRevenue = chambers.reduce((sum, c) => sum + c.revenue, 0)

  const getWeekDayDisplay = (weekNumber: string, weekDay: string) => {
    const weekMap = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th",
      LAST: "Last",
    }
    return `${weekMap[weekNumber]} ${weekDay.charAt(0) + weekDay.slice(1).toLowerCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Chamber Management</h2>
          <p className="text-slate-600 mt-2">Manage doctor-pharmacy partnerships and chamber schedules</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Chamber</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Chambers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{chambers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Chambers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeChambers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingChambers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Chambers</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Chambers</CardTitle>
              <CardDescription>Complete list of doctor-pharmacy chamber partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by doctor, pharmacy, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chambers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chambers Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Slots</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChambers.map((chamber) => (
                      <TableRow key={chamber.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{chamber.doctor.name}</div>
                            <div className="text-sm text-slate-500">{chamber.doctor.specialization}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{chamber.pharmacy.name}</div>
                            <div className="text-sm text-slate-500">{chamber.pharmacy.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}</div>
                            <div className="text-sm text-slate-500">
                              {chamber.startTime} - {chamber.endTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{chamber.fees}</TableCell>
                        <TableCell>{chamber.maxSlots} slots</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={chamber.isVerified ? "default" : "secondary"}>
                              {chamber.isVerified ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Verified</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Pending</span>
                                </div>
                              )}
                            </Badge>
                            <Badge variant={chamber.isActive ? "outline" : "secondary"}>
                              {chamber.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedChamber(chamber)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!chamber.isVerified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => setVerifyingChamber(chamber)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verified Chambers</CardTitle>
              <CardDescription>Active and verified doctor-pharmacy partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chambers
                  .filter((c) => c.isVerified)
                  .map((chamber) => (
                    <Card key={chamber.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <Badge variant={chamber.isActive ? "outline" : "secondary"}>
                            {chamber.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{chamber.doctor.name}</h3>
                        <p className="text-slate-600 text-sm mb-2">{chamber.doctor.specialization}</p>
                        <p className="text-slate-500 text-sm mb-4">{chamber.pharmacy.name}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Schedule:</span>
                            <span>{getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Time:</span>
                            <span>
                              {chamber.startTime} - {chamber.endTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Fees:</span>
                            <span>₹{chamber.fees}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Appointments:</span>
                            <span>{chamber.totalAppointments}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>Chambers awaiting admin verification and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chambers
                  .filter((c) => !c.isVerified)
                  .map((chamber) => (
                    <Card key={chamber.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{chamber.doctor.name}</h3>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-1">
                              {chamber.doctor.specialization} at {chamber.pharmacy.name}
                            </p>
                            <p className="text-slate-500 text-sm mb-2">
                              Schedule: {getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}, {chamber.startTime} -{" "}
                              {chamber.endTime}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Fees: ₹{chamber.fees}</span>
                              <span>Slots: {chamber.maxSlots}</span>
                              <span>Duration: {chamber.slotDuration}min</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-2">
                              Submitted: {new Date(chamber.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedChamber(chamber)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" onClick={() => setVerifyingChamber(chamber)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chamber Schedule Overview</CardTitle>
              <CardDescription>Weekly schedule view of all active chambers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="space-y-2">
                    <h3 className="font-semibold text-center p-2 bg-slate-100 rounded">{day}</h3>
                    <div className="space-y-2 min-h-32">
                      {chambers
                        .filter((c) => c.weekDay === day.toUpperCase() && c.isActive)
                        .map((chamber) => (
                          <Card key={chamber.id} className="p-2 text-xs">
                            <div className="font-medium truncate">{chamber.doctor.name}</div>
                            <div className="text-slate-500 truncate">{chamber.pharmacy.name}</div>
                            <div className="text-slate-400">
                              {chamber.startTime}-{chamber.endTime}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedChamber && (
        <ChamberDetailsModal
          chamber={selectedChamber}
          isOpen={!!selectedChamber}
          onClose={() => setSelectedChamber(null)}
        />
      )}

      <CreateChamberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChamberCreated={(newChamber) => {
          setChambers([...chambers, newChamber])
          setIsCreateModalOpen(false)
        }}
      />

      {verifyingChamber && (
        <VerifyChamberModal
          chamber={verifyingChamber}
          isOpen={!!verifyingChamber}
          onClose={() => setVerifyingChamber(null)}
          onVerified={(chamberId) => {
            setChambers(
              chambers.map((c) =>
                c.id === chamberId ? { ...c, isVerified: true, verificationDate: new Date().toISOString() } : c,
              ),
            )
            setVerifyingChamber(null)
          }}
        />
      )}
    </div>
  )
}
