import { SAMPLE_MEMBERS } from "./membersData";

function IconPerson() {
  return (
    <svg className="member-avatar-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

export function MembersPage() {
  return (
    <section className="section section--members" aria-label="Senarai ahli">
      <ul className="members-list">
        {SAMPLE_MEMBERS.map((m) => (
          <li key={m.id}>
            <div className="member-row">
              <div className="member-avatar" aria-hidden>
                <IconPerson />
              </div>
              <div className="member-text">
                <div className="member-name">{m.name}</div>
                <div className="member-cawangan">{m.cawangan}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
