"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import useDocumentStore from "@/stores/documentStore";
import { motion } from "framer-motion";
import { Upload, FileText, ArrowRight } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function UploadPage() {
  const user = useAuthStore((s) => s.user);

  const {
    file,
    setFile,
    uploadAndParse,
    calculate,
    exportResults,
    pages,
    fields,
    results,
    uploading,
    parsing,
    calculating,
    exporting,
    error,
    clear,
  } = useDocumentStore();

  const [newLabel, setNewLabel] = React.useState("");
  const [newValue, setNewValue] = React.useState("");

  const { addField, removeField, toggleFieldIncluded } = useDocumentStore();

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background2.jpg)" }}
      />
      {/* Gradient overlay for brand colors */}
      <div className="fixed inset-0 -z-15 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-black/10 pointer-events-none" />

      {/* Foreground */}
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-brand-primary drop-shadow-lg">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-brand-accent/90 drop-shadow-sm">
            Upload your document to parse, calculate, and export results.
          </p>
        </motion.div>

        {/* Upload + Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-3 bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <Upload className="h-5 w-5 text-brand-accent" />
                Upload Document
              </CardTitle>
              <CardDescription className="text-brand-subtext">
                Supported: PDF, PNG, JPG. Max 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-tint file:text-brand-primary hover:file:bg-brand-mint-light file:cursor-pointer"
              />

              {pages.length > 0 && (
                <div className="text-sm text-brand-dark">
                  {pages.length} page{pages.length > 1 ? "s" : ""} extracted.
                </div>
              )}

              {fields && (
                <div className="text-sm text-brand-dark">
                  {fields.length} fields detected.
                </div>
              )}

              {results && (
                <div className="text-sm text-brand-dark">
                  Calculated {Object.keys(results).length} result(s).
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600">{error.join(", ")}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button
                className="bg-brand-primary hover:bg-brand-purple-light text-brand-white"
                onClick={() => uploadAndParse(file)}
                disabled={!file || uploading}
              >
                {uploading || parsing ? "Processing..." : "Upload & Parse"}
              </Button>

              <Button
                className="bg-brand-accent hover:bg-brand-teal-dark text-brand-white"
                onClick={() => calculate("v1")}
                disabled={!fields || calculating}
              >
                {calculating ? "Calculating..." : "Calculate"}
              </Button>

              <Button
                className="bg-brand-purple-light hover:bg-brand-primary text-brand-white"
                onClick={() =>
                  exportResults({ format: "pdf", fileName: "report" })
                }
                disabled={!results || exporting}
              >
                {exporting ? "Exporting..." : "Export PDF"}
              </Button>

              <Button 
                variant="outline" 
                onClick={clear}
                className="border-brand-primary text-brand-primary hover:bg-brand-tint"
              >
                Clear
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Parsed Fields */}
        {fields && fields.length > 0 && (
          <Card className="bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <FileText className="h-5 w-5 text-brand-accent" />
                Parsed Fields
              </CardTitle>
              <CardDescription className="text-brand-subtext">
                Detected fields from your document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-brand-tint text-sm">
                {fields.map((f, idx) => (
                  <li
                    key={f.id || idx}
                    className="py-2 flex justify-between items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={f.included}
                        onChange={() => toggleFieldIncluded(idx)}
                        className="w-4 h-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                      />
                      <span
                        className={
                          f.included ? "text-brand-dark" : "line-through text-brand-subtext"
                        }
                      >
                        {f.label}: {f.value}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(idx)}
                      className="border-brand-primary text-brand-primary hover:bg-brand-tint"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Add new field */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="border border-brand-tint focus:border-brand-accent focus:ring-brand-accent px-2 py-1 rounded w-1/3 text-brand-dark"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="border border-brand-tint focus:border-brand-accent focus:ring-brand-accent px-2 py-1 rounded w-1/3 text-brand-dark"
                />
                <Button
                  className="bg-brand-primary hover:bg-brand-purple-light text-brand-white"
                  onClick={() => {
                    if (!newLabel || !newValue)
                      return toast.error("Label and value required");
                    addField({ label: newLabel, value: newValue });
                    setNewLabel("");
                    setNewValue("");
                  }}
                >
                  Add Field
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculated Results */}
        {results && (
          <Card className="bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <FileText className="h-5 w-5 text-brand-accent" />
                Calculated Results
              </CardTitle>
              <CardDescription className="text-brand-subtext">
                Computed results from the parsed fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-brand-tint text-sm">
                {Object.entries(results).map(([key, value], idx) => (
                  <li key={idx} className="py-2 flex justify-between text-brand-dark">
                    <span className="font-medium">{key}</span>
                    <span className="text-brand-accent font-semibold">{value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}