using Microsoft.EntityFrameworkCore;
using ProjectDefense.Common.Constants;
using ProjectDefense.Common.DTOs.Main;
using ProjectDefense.Common.Extensions;
using ProjectDefense.Common.FilterOptions;
using ProjectDefense.Common.Models.Main.Attribute;
using ProjectDefense.Data.Entities.MainEntities;
using ProjectDefense.Data.Repositories.Interfaces;

using ProjectDefense.Service.Common.Interfaces;
using ProjectDefense.Service.Main.Base;
using ProjectDefense.Service.Main.Interfaces;
using ProjectDefense.Service.Main.QueryObjects;
using StatusGeneric;

namespace ProjectDefense.Service.Main
{
    public class AttributeService : BaseMainService<Data.Entities.MainEntities.Attribute, AttributeFilterOptions, AttributeDto, AttributeCreateModel, AttributeUpdateModel> , IAttributeService
    {
        private readonly IBaseRepository<UserRole> _userRoleRepository;

        private readonly IBaseRepository<AttributeOption> _optionsRepository;


        public AttributeService(
            IBaseRepository<Data.Entities.MainEntities.Attribute> repository,
            IBaseRepository<UserRole> userRoleRepository,
            IBaseRepository<AttributeOption> optionRepository,
            IUserHelper userHelper)
            : base(repository,userHelper)
        {
            _userRoleRepository = userRoleRepository;
            _optionsRepository = optionRepository;
        }

        protected override IQueryable<Data.Entities.MainEntities.Attribute> ApplyFilter(IQueryable<Data.Entities.MainEntities.Attribute> query, AttributeFilterOptions options) =>
            query.ApplyFilter(options);

        protected override Data.Entities.MainEntities.Attribute BuildNewEntity(AttributeCreateModel createModel, Guid userId) => new()
        {
            Name = createModel.Name,
            Description = createModel.Description,
            DtypeCode = createModel.DtypeCode,
            CategoryCode = createModel.CategoryCode
        };

        protected override async Task<bool> CanModify(Data.Entities.MainEntities.Attribute entity, Guid userId) =>
            await _userRoleRepository.GetAll()
            .AnyAsync(ur => ur.UserId == userId
            && (ur.RoleCode == RoleConstants.Recruiter || ur.RoleCode == RoleConstants.Administrator));

        protected override IQueryable<Data.Entities.MainEntities.Attribute> GetAllQuery() =>
            _repository.GetAll(a => a.DType!, a => a.CategoryType!);

        public async Task<List<AttributeDto>> SearchByPrefixAsync(string prefix, int limit = 10)
        {
            var attributes = await _repository.GetAll(a => a.DType!, a => a.CategoryType!)
                .Where(a => EF.Functions.Like(a.Name, prefix + "%"))
                .Take(limit)
                .ToListAsync();

            return attributes.MapToDtos<Data.Entities.MainEntities.Attribute, AttributeDto>();
        }

        public override async Task<TId?> AddAsync<TId>(AttributeCreateModel createModel) where TId  : struct
        {
            var id = await base.AddAsync<TId>(createModel);

            if (id == null) return id;

            if (createModel.DtypeCode == AttributeDtypeConstants.OneOfMany && createModel.Options.Count > 0)
                await SaveOptions(Convert.ToInt32(id), createModel.Options);

            return id;

        }
        public override async Task<IStatusGeneric> DeleteAsync<TId>(TId id)
        {
            var entity = await _repository.GetById(id);
            if (entity is null)
            {
                AddError("Entity not found");
                return this;
            }

            if (!entity.IsRemovable)
            {
                AddError($"'{entity.Name}' is a built-in attribute and cannot be deleted.");
                return this;
            }

            return await base.DeleteAsync(id);
        }

        private async Task SaveOptions(int attributeId, List<string> labels)
        {
            var options = labels.Select((label, i) => new AttributeOption
            {
                AttributeId = attributeId,
                Label = label,
                SortOrder = (short)i

            }).ToList();

            _optionsRepository.AddRange(options);
            await _optionsRepository.SaveChanges();
        }
    }
}
