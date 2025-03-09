// Type declarations for shadcn/ui components

declare module '@/components/ui/button' {
  export const Button: React.ComponentType<any>;
}

declare module '../components/ui/button' {
  export const Button: React.ComponentType<any>;
}

declare module '@/components/ui/card' {
  export const Card: React.ComponentType<any>;
  export const CardHeader: React.ComponentType<any>;
  export const CardTitle: React.ComponentType<any>;
  export const CardDescription: React.ComponentType<any>;
  export const CardContent: React.ComponentType<any>;
  export const CardFooter: React.ComponentType<any>;
}

declare module '../components/ui/card' {
  export const Card: React.ComponentType<any>;
  export const CardHeader: React.ComponentType<any>;
  export const CardTitle: React.ComponentType<any>;
  export const CardDescription: React.ComponentType<any>;
  export const CardContent: React.ComponentType<any>;
  export const CardFooter: React.ComponentType<any>;
}

declare module '@/components/ui/tabs' {
  export const Tabs: React.ComponentType<any>;
  export const TabsList: React.ComponentType<any>;
  export const TabsTrigger: React.ComponentType<any>;
  export const TabsContent: React.ComponentType<any>;
}

declare module '../components/ui/tabs' {
  export const Tabs: React.ComponentType<any>;
  export const TabsList: React.ComponentType<any>;
  export const TabsTrigger: React.ComponentType<any>;
  export const TabsContent: React.ComponentType<any>;
}

declare module '@/components/ui/badge' {
  export const Badge: React.ComponentType<any>;
}

declare module '../components/ui/badge' {
  export const Badge: React.ComponentType<any>;
}

declare module '@/components/ui/select' {
  export const Select: React.ComponentType<any>;
  export const SelectGroup: React.ComponentType<any>;
  export const SelectValue: React.ComponentType<any>;
  export const SelectTrigger: React.ComponentType<any>;
  export const SelectContent: React.ComponentType<any>;
  export const SelectLabel: React.ComponentType<any>;
  export const SelectItem: React.ComponentType<any>;
  export const SelectSeparator: React.ComponentType<any>;
}

declare module '../components/ui/select' {
  export const Select: React.ComponentType<any>;
  export const SelectGroup: React.ComponentType<any>;
  export const SelectValue: React.ComponentType<any>;
  export const SelectTrigger: React.ComponentType<any>;
  export const SelectContent: React.ComponentType<any>;
  export const SelectLabel: React.ComponentType<any>;
  export const SelectItem: React.ComponentType<any>;
  export const SelectSeparator: React.ComponentType<any>;
}

declare module '@/components/ui/use-toast' {
  export const toast: {
    (props: any): void;
    dismiss: (toastId?: string) => void;
  };
}

declare module '../components/ui/use-toast' {
  export const toast: {
    (props: any): void;
    dismiss: (toastId?: string) => void;
  };
} 