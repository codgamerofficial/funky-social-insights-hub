import { Mail, Phone, MapPin, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const ContactInfo = () => {
  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 gradient-instagram rounded-xl flex items-center justify-center animate-float">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient-instagram">Contact Developer</h3>
          <p className="text-sm text-muted-foreground">Get in touch for support</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 gradient-facebook rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="text-foreground font-medium">saswatadey700@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 gradient-funky rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="text-foreground font-medium">+91 8145172429</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 text-sm">
          <div className="w-8 h-8 gradient-instagram rounded-lg flex items-center justify-center mt-1">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <div className="text-foreground font-medium">
              <p>Monohorchak Road near Sani Manir</p>
              <p>Contai, East Medinipur</p>
              <p>West Bengal, India - 721401</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactInfo;