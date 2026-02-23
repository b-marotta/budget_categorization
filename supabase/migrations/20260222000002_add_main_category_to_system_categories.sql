-- Add main category grouping to system categories

alter table system_categories
add column if not exists main_category text;

update system_categories
set main_category = case
  when type = 'income' then 'Income'
  when name in ('Alimentari', 'Ristoranti', 'Trasporti', 'Casa', 'Utilities', 'Salute') then 'Essential'
  when name in ('Shopping', 'Intrattenimento', 'Viaggi', 'Sport', 'Educazione', 'Abbonamenti') then 'Lifestyle'
  when type = 'expense' and name in ('Assicurazioni', 'Tasse', 'Investimenti') then 'Financial'
  when type = 'expense' and name in ('Regali', 'Animali', 'Altro') then 'Other'
  else coalesce(main_category, 'Other')
end
where main_category is null;

alter table system_categories
alter column main_category set not null;
