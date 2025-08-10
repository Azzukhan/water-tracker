"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, ExternalLink, MapPin, Clock } from "lucide-react";

const agencies = [
  {
    name: "Scottish Water",
    logo: "SW",
    description: "Scotland's water and wastewater services",
    phone: "0800 0778 778",
    emergency: "0800 0778 778",
    email: "help@scottishwater.co.uk",
    website: "scottishwater.co.uk",
    region: "Scotland",
    color: "bg-blue-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Scottish Environment Protection Agency",
    logo: "SEPA",
    description: "Environmental regulator for Scotland",
    phone: "0300 099 6699",
    emergency: "0800 807 060",
    email: "flooding@sepa.org.uk",
    website: "sepa.org.uk",
    region: "Scotland",
    color: "bg-indigo-700",
    hours: "24/7 Incident Line, office hours general",
  },
  {
    name: "Severn Trent Water",
    logo: "SevernTrent",
    description:
      "Water utility serving the Midlands and surrounding regions in England.",
    phone: "0345 750 0500",
    emergency: "0800 783 4444",
    email: "customer.relations@severntrent.co.uk",
    website: "stwater.co.uk",
    region: "Midlands & Central England",
    color: "bg-green-700",
    hours: "24/7 Emergency Line, general office hours for queries",
  },
  {
    name: "Yorkshire Water",
    logo: "YorkshireWater",
    description: "Water supply and wastewater services for Yorkshire.",
    phone: "0345 1 24 24 24",
    emergency: "0800 57 35 53",
    email: "customer.services@yorkshirewater.co.uk",
    website: "yorkshirewater.com",
    region: "Yorkshire, England",
    color: "bg-blue-800",
    hours: "24/7 Emergencies, office hours for customer service",
  },
  {
    name: "Southern Water",
    logo: "SouthernWater",
    description: "Water and wastewater services for the south of England.",
    phone: "0330 303 0368",
    emergency: "0330 303 0368",
    email: "customer.services@southernwater.co.uk",
    website: "southernwater.co.uk",
    region: "South East England",
    color: "bg-teal-700",
    hours: "24/7 Emergency Line, office hours for queries",
  },
  {
    name: "Environment Agency (Hydrology)",
    logo: "EA",
    description:
      "Government agency responsible for environmental protection and hydrology data across England.",
    phone: "03708 506 506",
    emergency: "0800 80 70 60",
    email: "enquiries@environment-agency.gov.uk",
    website: "environment.data.gov.uk/hydrology/",
    region: "England",
    color: "bg-emerald-700",
    hours:
      "24/7 Emergency Hotline, general enquiries Mon-Fri 8am–6pm",
  },
];

export function AgencyContacts() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [localCompany, setLocalCompany] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const regions = Array.from(new Set(agencies.map((a) => a.region)));
  const filteredAgencies =
    selectedRegion === "All"
      ? agencies
      : agencies.filter((a) => a.region === selectedRegion);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getCompanyFromAddress = (address: any) => {
    const state = address?.state || "";
    if (state.includes("Scotland")) {
      return "Scottish Water";
    }
    return "Scottish Water";
  };

  const handleFindMyCompany = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
            const data = await res.json();
            setLocalCompany(getCompanyFromAddress(data.address));
          } catch (e) {
            console.error(e);
            setLocalCompany(null);
          }
          setLocating(false);
        },
        (error) => {
          console.error(error);
          setLocating(false);
        },
      );
    } else {
      setLocating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <CardTitle className="text-2xl font-bold">
          UK Water Agency Contacts
        </CardTitle>
        <p className="text-gray-300 dark:text-gray-400">
          Direct contact information for regional water authorities
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 flex justify-end">
          <Select
            value={selectedRegion}
            onValueChange={(v) => {
              setSelectedRegion(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* KEY: Add items-stretch for perfect row alignment */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {paginatedAgencies.map((agency, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full min-h-[350px] bg-white dark:bg-gray-800"
            >
              {/* Main card content: fills space above buttons */}
              <div className="flex-1 flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 ${agency.color} rounded-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-sm">
                        {agency.logo}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{agency.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agency.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Region */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{agency.region}</span>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm font-medium">General</span>
                    </div>
                    <a
                      href={`tel:${agency.phone}`}
                      className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {agency.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-red-500 dark:text-red-400" />
                      <span className="text-sm font-medium">Emergency</span>
                    </div>
                    <a
                      href={`tel:${agency.emergency}`}
                      className="text-sm font-mono text-red-600 dark:text-red-400 hover:underline"
                    >
                      {agency.emergency}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <a
                      href={`mailto:${agency.email}`}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline truncate"
                    >
                      Contact
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    {agency.hours.split(",").map((part, idx) => (
                      <div key={idx}>{part.trim()}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Buttons: outside flex-1, guaranteed bottom-aligned */}
              <div className="flex gap-2 mt-6">
                <Button
                  size="sm"
                  className={`${agency.color} text-white hover:brightness-90 cursor-pointer w-full`}
                  asChild
                >
                  <a href={`tel:${agency.phone}`}>
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://${agency.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredAgencies.length)} of{" "}
            {filteredAgencies.length} agencies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Finding Your Water Company
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                Not sure which water company serves your area? Use your postcode
                to find your local water authority.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500"
                onClick={handleFindMyCompany}
                disabled={locating}
              >
                {locating ? "Finding..." : "Find My Water Company"}
              </Button>
              {localCompany && (
                <p className="text-blue-800 dark:text-blue-200 text-sm mt-3">
                  Your local company: {localCompany}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
