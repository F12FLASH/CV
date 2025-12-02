import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Languages, Plus, Download, Upload, Trash2, Edit2, Check, X, Globe, Search
} from "lucide-react";
import { useState, useRef } from "react";
import { useLanguage, LanguageData, TranslationData } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LanguageManager() {
  const { 
    languages, 
    currentLanguage, 
    setCurrentLanguage, 
    addLanguage, 
    removeLanguage, 
    updateTranslations,
    exportLanguage,
    importLanguage 
  } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [newLangNative, setNewLangNative] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>(languages[0]?.code || "en");
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newTranslations, setNewTranslations] = useState<Record<string, string>>({});

  const handleAddLanguage = () => {
    if (!newLangCode || !newLangName) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const baseTranslations = languages.find(l => l.code === "en")?.translations || {};
    
    addLanguage({
      code: newLangCode.toLowerCase(),
      name: newLangName,
      nativeName: newLangNative || newLangName,
      translations: { ...baseTranslations },
    });

    toast({ title: "Success", description: `Language "${newLangName}" added successfully` });
    setNewLangCode("");
    setNewLangName("");
    setNewLangNative("");
  };

  const handleExport = (code: string) => {
    const data = exportLanguage(code);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `language_${code}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Language file exported successfully` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importLanguage(content)) {
        toast({ title: "Imported", description: "Language imported successfully" });
      } else {
        toast({ title: "Error", description: "Invalid language file format", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveTranslation = (langCode: string, key: string, value: string) => {
    updateTranslations(langCode, { [key]: value });
    setEditingKey(null);
    setEditingValue("");
    toast({ title: "Saved", description: "Translation updated" });
  };

  const handleAddKey = () => {
    if (!newKey) return;
    
    languages.forEach(lang => {
      updateTranslations(lang.code, { [newKey]: newTranslations[lang.code] || newKey });
    });
    
    setNewKeyDialog(false);
    setNewKey("");
    setNewTranslations({});
    toast({ title: "Added", description: "New translation key added" });
  };

  const filteredKeys = Object.keys(languages.find(l => l.code === selectedLang)?.translations || {})
    .filter(key => 
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (languages.find(l => l.code === selectedLang)?.translations[key] || "")
        .toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
              <Languages className="w-8 h-8" /> Language Manager
            </h1>
            <p className="text-muted-foreground">Manage translations and language settings</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={handleImport}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Available languages in your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div 
                    key={lang.code}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedLang === lang.code ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLang(lang.code)}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-sm text-muted-foreground">{lang.nativeName} ({lang.code})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentLanguage === lang.code && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(lang.code);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {lang.code !== "en" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLanguage(lang.code);
                            toast({ title: "Removed", description: `Language "${lang.name}" removed` });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium text-sm">Add New Language</h4>
                <div className="space-y-2">
                  <Input 
                    placeholder="Language code (e.g. fr, de, ja)" 
                    value={newLangCode}
                    onChange={(e) => setNewLangCode(e.target.value)}
                  />
                  <Input 
                    placeholder="Language name (e.g. French)" 
                    value={newLangName}
                    onChange={(e) => setNewLangName(e.target.value)}
                  />
                  <Input 
                    placeholder="Native name (e.g. Français)" 
                    value={newLangNative}
                    onChange={(e) => setNewLangNative(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAddLanguage}>
                    <Plus className="w-4 h-4 mr-2" /> Add Language
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Translations</CardTitle>
                  <CardDescription>
                    Edit translations for {languages.find(l => l.code === selectedLang)?.name}
                  </CardDescription>
                </div>
                <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Translation Key</DialogTitle>
                      <DialogDescription>
                        Add a new translation key and its values for all languages
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Translation Key</Label>
                        <Input 
                          placeholder="e.g. nav.newPage"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                        />
                      </div>
                      {languages.map(lang => (
                        <div key={lang.code} className="space-y-2">
                          <Label>{lang.name} ({lang.code})</Label>
                          <Input 
                            placeholder={`Translation in ${lang.name}`}
                            value={newTranslations[lang.code] || ""}
                            onChange={(e) => setNewTranslations(prev => ({
                              ...prev,
                              [lang.code]: e.target.value
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewKeyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKey}>Add Key</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search translations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredKeys.map((key) => {
                  const lang = languages.find(l => l.code === selectedLang);
                  const value = lang?.translations[key] || "";
                  const isEditing = editingKey === key;

                  return (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{key}</code>
                        {!isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingKey(key);
                              setEditingValue(value);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input 
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleSaveTranslation(selectedLang, key, editingValue)}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => {
                              setEditingKey(null);
                              setEditingValue("");
                            }}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm">{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Default Language</CardTitle>
            <CardDescription>Set the default language for your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={currentLanguage === lang.code ? "default" : "outline"}
                  onClick={() => {
                    setCurrentLanguage(lang.code);
                    toast({ title: "Default Changed", description: `Default language set to ${lang.name}` });
                  }}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {lang.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
