import React, { useState } from "react";
import { icons } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

const popularIcons = [
  "IdCard", "Cake", "Apple", "KeyRound", "Wrench", "Star", "Smartphone", "Unlock",
  "Bot", "Camera", "Globe", "Search", "TabletSmartphone", "Image", "Moon", "Users",
  "ExternalLink", "Hammer", "ShoppingBag", "Zap", "Shield", "Heart", "Settings",
  "Package", "Monitor", "Cpu", "Wifi", "Mail", "FileText", "Bookmark", "Download",
  "Play", "Music", "Video", "Map", "Clock", "Calendar", "CreditCard", "Truck",
  "Phone", "Headphones", "Laptop", "Printer", "Database", "Home", "Bell", "Gift",
  "Award", "Target", "Compass", "Scissors", "Pen", "Book", "Gamepad2", "Palette",
  "Mic", "Radio", "Tv", "Layers", "Code", "Terminal", "CloudUpload", "Share2",
  "Link", "QrCode", "Fingerprint", "ScanLine", "Sparkles", "Flame", "Rocket",
  "Crown", "Trophy", "Medal", "BadgeCheck", "CircleDollarSign", "Banknote",
  "Wallet", "Store", "ShoppingCart", "Receipt", "BarChart3", "PieChart",
  "TrendingUp", "Activity", "Eye", "Lock", "Key", "RefreshCw", "RotateCw",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const SelectedIcon = value && (icons as any)[value] ? (icons as any)[value] : null;

  const allIconNames = search.length > 0
    ? Object.keys(icons).filter(n => n.toLowerCase().includes(search.toLowerCase())).slice(0, 80)
    : popularIcons.filter(n => (icons as any)[n]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-14 h-9 p-0 shrink-0">
          {SelectedIcon ? <SelectedIcon className="h-5 w-5 text-primary" /> : <span className="text-xs text-muted-foreground">Icon</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="pl-7 h-8 text-xs"
          />
        </div>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-6 gap-1">
            {allIconNames.map(name => {
              const Icon = (icons as any)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                  className={`p-2 rounded-lg hover:bg-accent/20 transition-colors flex items-center justify-center ${value === name ? "bg-primary/10 ring-1 ring-primary" : ""}`}
                  title={name}
                >
                  <Icon className="h-4.5 w-4.5 text-foreground" />
                </button>
              );
            })}
          </div>
          {allIconNames.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No icons found</p>
          )}
        </ScrollArea>
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          {search ? "Type to search all icons" : "Popular icons · Search for more"}
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
