using Demo.Entities;
using Demo.Services.Models;
using Riok.Mapperly.Abstractions;

namespace Demo.Services.Mappers
{
    [Mapper]
    public partial class QuestionnaireScriptMapper
    {
        [MapperIgnoreSource(nameof(QuestionnaireScript.History))]
        [MapperIgnoreTarget(nameof(QuestionnaireScriptModel.CurrentUserId))]
        [MapperIgnoreTarget(nameof(QuestionnaireScriptModel.ChangeNote))]
        [MapperIgnoreTarget(nameof(QuestionnaireScriptModel.History))]
        public partial QuestionnaireScriptModel ToModel(QuestionnaireScript source);

        [MapperIgnoreSource(nameof(QuestionnaireScriptModel.CurrentUserId))]
        [MapperIgnoreSource(nameof(QuestionnaireScriptModel.ChangeNote))]
        [MapperIgnoreSource(nameof(QuestionnaireScriptModel.History))]
        [MapperIgnoreTarget(nameof(QuestionnaireScript.History))]
        public partial QuestionnaireScript ToEntity(QuestionnaireScriptModel source);

        [MapperIgnoreSource(nameof(QuestionnaireScriptHistory.QuestionnaireScript))]
        [MapperIgnoreTarget(nameof(QuestionnaireScriptHistoryModel.QuestionnaireScript))]
        public partial QuestionnaireScriptHistoryModel ToHistoryModel(QuestionnaireScriptHistory source);

        [MapperIgnoreSource(nameof(QuestionnaireScriptHistoryModel.QuestionnaireScript))]
        [MapperIgnoreTarget(nameof(QuestionnaireScriptHistory.QuestionnaireScript))]
        public partial QuestionnaireScriptHistory ToHistoryEntity(QuestionnaireScriptHistoryModel source);

        public IEnumerable<QuestionnaireScriptModel> ToModels(IEnumerable<QuestionnaireScript> source)
            => source.Select(ToModel);

        public IEnumerable<QuestionnaireScriptHistoryModel> ToHistoryModels(IEnumerable<QuestionnaireScriptHistory> source)
            => source.Select(ToHistoryModel);

        public List<QuestionnaireScriptHistoryModel> ToHistoryModelList(IEnumerable<QuestionnaireScriptHistory> source)
            => source.Select(ToHistoryModel).ToList();
    }
}
