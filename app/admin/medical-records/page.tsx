"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Stethoscope,
  Calendar,
  Plus,
  Download,
  Heart,
  Activity,
  Pill,
} from "lucide-react"

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const medicalRecords = [
    {
      id: "MR-001",
      patientName: "John Doe",
      patientAge: 35,
      doctorName: "Dr. Sarah Johnson",
      date: "2024-01-15",
      type: "consultation",
      diagnosis: "Hypertension",
      prescription: "Amlodipine 5mg, Metformin 500mg",
      symptoms: "High blood pressure, dizziness",
      vitals: {
        bp: "140/90",
        pulse: "78",
        temp: "98.6°F",
        weight: "75kg",
      },
      followUp: "2024-02-15",
      status: "active",
    },
    {
      id: "MR-002",
      patientName: "Jane Smith",
      patientAge: 28,
      doctorName: "Dr. Rajesh Kumar",
      date: "2024-01-14",
      type: "emergency",
      diagnosis: "Acute Bronchitis",
      prescription: "Azithromycin 500mg, Salbutamol inhaler",
      symptoms: "Persistent cough, chest congestion",
      vitals: {
        bp: "120/80",
        pulse: "85",
        temp: "101.2°F",
        weight: "62kg",
      },
      followUp: "2024-01-21",
      status: "completed",
    },
    {
      id: "MR-003",
      patientName: "Mike Johnson",
      patientAge: 42,
      doctorName: "Dr. Priya Sharma",
      date: "2024-01-13",
      type: "followup",
      diagnosis: "Diabetes Type 2 - Follow-up",
      prescription: "Metformin 1000mg, Glimepiride 2mg",
      symptoms: "Regular checkup, blood sugar monitoring",
      vitals: {
        bp: "130/85",
        pulse: "72",
        temp: "98.4°F",
        weight: "80kg",
      },
      followUp: "2024-04-13",
      status: "active",
    },
  ]

  const stats = [
    {
      title: "Total Records",
      value: "3,247",
      change: "+18%",
      icon: FileText,
      color: "blue",
    },
    {
      title: "Active Treatments",
      value: "156",
      change: "+5%",
      icon: Activity,
      color: "green",
    },
    {
      title: "Follow-ups Due",
      value: "23",
      change: "-12%",
      icon: Calendar,
      color: "orange",
    },
    {
      title: "Critical Cases",
      value: "8",
      change: "+2",
      icon: Heart,
      color: "red",
    },
  ]

  const getTypeBadge = (type: string) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      emergency: "bg-red-100 text-red-800",
      followup: "bg-green-100 text-green-800",
      routine: "bg-gray-100 text-gray-800",
    } as const

    return <Badge className={colors[type as keyof typeof colors]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    } as const

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || record.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-slate-600 mt-2">Manage patient medical histories and treatment records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Medical Records Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical Records Management</CardTitle>
              <CardDescription>View and manage patient medical histories</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="records" className="space-y-4">
            <TabsList>
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            </TabsList>

            <TabsContent value="records">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.patientName}</p>
                          <p className="text-sm text-slate-500">Age: {record.patientAge}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-slate-400" />
                          <span>{record.doctorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{getTypeBadge(record.type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.diagnosis}</p>
                          <p className="text-sm text-slate-500 truncate max-w-32">{record.symptoms}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.followUp}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="prescriptions">
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{record.patientName}</CardTitle>
                          <CardDescription>
                            Prescribed by {record.doctorName} on {record.date}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Pill className="h-5 w-5 text-slate-400" />
                          {getTypeBadge(record.type)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Diagnosis</h4>
                          <p className="text-slate-600">{record.diagnosis}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Prescription</h4>
                          <p className="text-slate-600">{record.prescription}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vitals">
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{record.patientName}</CardTitle>
                          <CardDescription>
                            Recorded on {record.date} by {record.doctorName}
                          </CardDescription>
                        </div>
                        <Activity className="h-5 w-5 text-slate-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Blood Pressure</p>
                          <p className="text-lg font-semibold text-slate-900">{record.vitals.bp}</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Pulse Rate</p>
                          <p className="text-lg font-semibold text-slate-900">{record.vitals.pulse} bpm</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Temperature</p>
                          <p className="text-lg font-semibold text-slate-900">{record.vitals.temp}</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Weight</p>
                          <p className="text-lg font-semibold text-slate-900">{record.vitals.weight}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
