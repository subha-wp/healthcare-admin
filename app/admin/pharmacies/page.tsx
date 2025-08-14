"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Eye, Edit, CheckCircle, MapPin, FileText, Clock, Star } from "lucide-react"
import { PharmacyDetailsModal } from "@/components/admin/pharmacy-details-modal"
import { CreatePharmacyModal } from "@/components/admin/create-pharmacy-modal"
import { VerifyPharmacyModal } from "@/components/admin/verify-pharmacy-modal"

// Mock data - replace with actual API calls
const mockPharmacies = [
  {
    id: "1",
    userId: "user1",
    name: "MedPlus Pharmacy",
    businessName: "MedPlus Healthcare Pvt Ltd",
    email: "contact@medplus.com",
    phone: "+1234567890",
    address: "123 Health Street, Medical District, City - 400001",
    location: { lat: 19.076, lng: 72.8777 },
    gstin: "27AABCU9603R1ZX",
    tradeLicense: "TL123456789",
    isVerified: true,
    verificationDate: "2024-01-15",
    avatarUrl: null,
    documents: {
      tradeLicense: "/docs/trade_license_123.pdf",
      gstin: "/docs/gstin_123.pdf",
    },
    chambers: 5,
    totalAppointments: 342,
    rating: 4.7,
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    userId: "user2",
    name: "Apollo Pharmacy",
    businessName: "Apollo Health & Lifestyle Ltd",
    email: "info@apollopharmacy.com",
    phone: "+1234567891",
    address: "456 Wellness Avenue, Healthcare Hub, City - 400002",
    location: { lat: 19.0896, lng: 72.8656 },
    gstin: "27AABCA1234B1Z5",
    tradeLicense: "TL987654321",
    isVerified: false,
    verificationDate: null,
    avatarUrl: null,
    documents: {
      tradeLicense: "/docs/trade_license_456.pdf",
      gstin: "/docs/gstin_456.pdf",
    },
    chambers: 2,
    totalAppointments: 156,
    rating: 4.5,
    createdAt: "2024-01-20",
  },
]

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState(mockPharmacies)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [verifyingPharmacy, setVerifyingPharmacy] = useState(null)

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && pharmacy.isVerified) ||
      (verificationFilter === "pending" && !pharmacy.isVerified)

    return matchesSearch && matchesVerification
  })

  const verifiedPharmacies = pharmacies.filter((p) => p.isVerified).length
  const pendingPharmacies = pharmacies.filter((p) => !p.isVerified).length
  const totalChambers = pharmacies.reduce((sum, p) => sum + p.chambers, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Pharmacy Management</h2>
          <p className="text-slate-600 mt-2">Manage pharmacy registrations, verification, and business credentials</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Pharmacy</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pharmacies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pharmacies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedPharmacies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingPharmacies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Chambers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalChambers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Pharmacies</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Pharmacies</CardTitle>
              <CardDescription>Complete list of registered pharmacies</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search pharmacies by name, business name, or GSTIN..."
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
              </div>

              {/* Pharmacies Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPharmacies.map((pharmacy) => (
                      <TableRow key={pharmacy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pharmacy.name}</div>
                            <div className="text-sm text-slate-500">{pharmacy.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{pharmacy.businessName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="text-sm truncate max-w-32">{pharmacy.address.split(",")[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pharmacy.gstin}</TableCell>
                        <TableCell>
                          <Badge variant={pharmacy.isVerified ? "default" : "secondary"}>
                            {pharmacy.isVerified ? (
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{pharmacy.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPharmacy(pharmacy)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!pharmacy.isVerified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => setVerifyingPharmacy(pharmacy)}
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
              <CardTitle>Verified Pharmacies</CardTitle>
              <CardDescription>Pharmacies that have completed business verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pharmacies
                  .filter((p) => p.isVerified)
                  .map((pharmacy) => (
                    <Card key={pharmacy.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{pharmacy.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{pharmacy.name}</h3>
                        <p className="text-slate-600 text-sm mb-2">{pharmacy.businessName}</p>
                        <div className="flex items-center space-x-1 mb-4">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <p className="text-slate-500 text-xs truncate">{pharmacy.address.split(",")[0]}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{pharmacy.chambers} chambers</span>
                          <span>{pharmacy.totalAppointments} appointments</span>
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
              <CardDescription>Pharmacies awaiting business verification approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacies
                  .filter((p) => !p.isVerified)
                  .map((pharmacy) => (
                    <Card key={pharmacy.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-1">{pharmacy.businessName}</p>
                            <div className="flex items-center space-x-1 mb-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <p className="text-slate-500 text-sm">{pharmacy.address.split(",")[0]}</p>
                            </div>
                            <p className="text-slate-500 text-sm">GSTIN: {pharmacy.gstin}</p>
                            <p className="text-slate-500 text-sm">
                              Submitted: {new Date(pharmacy.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedPharmacy(pharmacy)}>
                              <FileText className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" onClick={() => setVerifyingPharmacy(pharmacy)}>
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

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Locations</CardTitle>
              <CardDescription>Geographic distribution of registered pharmacies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Interactive map view would be implemented here</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Showing {pharmacies.length} pharmacy locations across the city
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedPharmacy && (
        <PharmacyDetailsModal
          pharmacy={selectedPharmacy}
          isOpen={!!selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}

      <CreatePharmacyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPharmacyCreated={(newPharmacy) => {
          setPharmacies([...pharmacies, newPharmacy])
          setIsCreateModalOpen(false)
        }}
      />

      {verifyingPharmacy && (
        <VerifyPharmacyModal
          pharmacy={verifyingPharmacy}
          isOpen={!!verifyingPharmacy}
          onClose={() => setVerifyingPharmacy(null)}
          onVerified={(pharmacyId) => {
            setPharmacies(
              pharmacies.map((p) =>
                p.id === pharmacyId ? { ...p, isVerified: true, verificationDate: new Date().toISOString() } : p,
              ),
            )
            setVerifyingPharmacy(null)
          }}
        />
      )}
    </div>
  )
}
