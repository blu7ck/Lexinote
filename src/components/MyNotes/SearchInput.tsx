import { FC } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput: FC<SearchInputProps> = ({ placeholder = 'Search...', value, onChange }) => {
  return (
    <div className="flex items-center bg-[#1d2926] rounded-full px-4 py-2 w-full max-w-md">
      <input
        type="text"
        className="bg-transparent outline-none text-white placeholder-gray-400 flex-1 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className="w-4 h-4 text-white" />
    </div>
  );
};
