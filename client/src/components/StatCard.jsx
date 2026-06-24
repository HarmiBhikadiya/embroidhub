export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-800 p-6 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-surface-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color] || colors.blue} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Decorative */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${colors[color] || colors.blue} opacity-5 group-hover:opacity-10 transition-opacity`} />
    </div>
  );
}
