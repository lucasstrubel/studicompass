import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/store/use-demo-store";
import { selectProfileName } from "@/store/selectors";
import { ProfileFields } from "./ProfileFields";
import {
  profileErrors,
  type ProfileDetails,
  type ProfileErrors,
} from "./profile-input";

function ProfileForm({ initial }: { initial: ProfileDetails }) {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const saveProfile = useDemoStore((state) => state.saveProfile);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = profileErrors(value);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (saveProfile(value)) toast("Profil gespeichert.");
  };
  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <ProfileFields
        value={value}
        errors={errors}
        onChange={(change) => {
          setValue((current) => ({ ...current, ...change }));
          setErrors({});
        }}
      />
      <Button type="submit">Profil speichern</Button>
    </form>
  );
}

export function ProfileSection() {
  const section = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#profil") section.current?.focus();
  }, [hash]);
  const name = useDemoStore(selectProfileName);
  const goalRegularTime = useDemoStore((state) => state.goalRegularTime);
  const jobHoursPerWeek = useDemoStore((state) => state.jobHoursPerWeek);
  return (
    <section
      ref={section}
      id="profil"
      tabIndex={-1}
      aria-labelledby="profile-title"
      className="scroll-mt-24 space-y-4 rounded-xl border bg-card p-4"
    >
      <h2 id="profile-title" className="text-section-title">
        Profil
      </h2>
      <p className="text-body text-muted-foreground">
        Dein Name erscheint in Begrüßung, Profil und Anfrage-Entwürfen.
        Änderungen bleiben in diesem Browser; die Beispieldaten aus dem POS
        bleiben erhalten.
      </p>
      <ResourceBoundary
        services={["pos"]}
        skeleton={
          <Skeleton
            role="status"
            aria-label="Profil wird geladen"
            className="h-40"
          />
        }
      >
        {() =>
          name && (
            <ProfileForm
              initial={{ ...name, goalRegularTime, jobHoursPerWeek }}
            />
          )
        }
      </ResourceBoundary>
    </section>
  );
}
